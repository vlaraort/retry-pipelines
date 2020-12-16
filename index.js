const { Gitlab } = require("@gitbeaker/node");
const Token = require("./src/token.js");
const { getArgs } = require("./src/commands.js");
const Terminal = require("./src/terminal.js");
const { parsePipelineUrl, isValidUrl } = require("./src/pipelineUrlParser.js");

// const { start, printJobs } = require("./src/terminal.js");

// let vault;
// try {
//   vault = require("./vault.js");
//  }
//  catch (e) {
//   console.log(chalk.red('No token found, please add a vault.js file with your Gitlab token, check the README for reference'))
//   process.exit(0)
//  }

// const { token } = vault;
let projectId;
let pipelineId;
let api;

const initApi = (host, token) => {
  api = new Gitlab({
    host,
    token,
    rejectUnauthorized: false,
  });
};

const getPipelineData = async () => {
  const pipelineInfo = await api.Pipelines.show(projectId, pipelineId);
  return pipelineInfo;
};

const getJobsData = async () => {
  const jobsInfo = await api.Jobs.showPipelineJobs(projectId, pipelineId);
  return jobsInfo;
};

const retryJob = async (job) => {
  return api.Jobs.retry(projectId, job.id);
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Filter the jobs array to get only the last one of every step
const filterJobs = (jobs) => {
  const maxes = {};
  for (const job of jobs) {
    if (!(job.name in maxes) || job.id > maxes[job.name].id) {
      maxes[job.name] = job;
    }
  }
  const filtered = Object.values(maxes);
  return filtered;
};

(async () => {
  async function run() {
    const pipelineData = await getPipelineData();
    if (pipelineData.status === "running" || pipelineData.status === "failed") {
      console.log("Fetching jobs status...");
      const jobsData = await getJobsData();
      const jobs = filterJobs(jobsData);
      Terminal.printJobs(jobs);
      for (const job of jobs) {
        if (job.status === "failed") {
          console.log(`retrying ${job.name} in ${job.stage} stage`);
          await retryJob(job);
        }
      }
      // retry in 1 minute
      console.log(`All failed jobs retried. Rechecking in one minute...`);
      await sleep(60000);
      await run();
    } else {
      console.log("Pipeline not running. Ending script");
    }
  }

  const args = getArgs();
  if (args.resetToken) {
    await Token.resetToken();
  } else {
    const token = await Token.checkToken();
    if (args.pipeline) {
      const url = args.pipeline;
      if (!isValidUrl(url)) {
        Terminal.printPipelineArgError();
        process.exit(0);
      } else {
        const urlData = parsePipelineUrl(url);
        const host = urlData.host;
        pipelineId = urlData.pipelineId;
        projectId = urlData.projectId;
        initApi(host, token);
        await run();
      }
    } else {
      const terminalInput = await Terminal.start();
      const host = terminalInput.host;
      pipelineId = terminalInput.pipelineId;
      projectId = terminalInput.projectId;
      initApi(host, token);
      await run();
    }
  }
})();
