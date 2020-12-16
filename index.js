#!/usr/bin/env node

const { Gitlab } = require("@gitbeaker/node");
const Token = require("./src/token.js");
const { getArgs } = require("./src/commands.js");
const Terminal = require("./src/terminal.js");
const { parsePipelineUrl, isValidUrl } = require("./src/pipelineUrlParser.js");

let projectId;
let pipelineId;
let api;

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const initApi = (host, token) => {
  api = new Gitlab({
    host,
    token,
    rejectUnauthorized: false,
  });
};

const getPipelineData = async () => {
  try {
    return api.Pipelines.show(projectId, pipelineId);
  } catch (e) {
    Terminal.printNetworkError();
    process.exit(0);
  }
};

const getJobsData = async () => {
  try {
    return api.Jobs.showPipelineJobs(projectId, pipelineId);
  } catch (e) {
    Terminal.printNetworkError();
    process.exit(0);
  }
};

const retryJob = async (job) => {
  try {
    return api.Jobs.retry(projectId, job.id);
  } catch (e) {
    Terminal.printNetworkError();
    process.exit(0);
  }
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

const run = async () => {
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
};

(async () => {
  const args = getArgs();
  if (args.resetToken) {
    await Token.resetToken();
  } else {
    const token = await Token.checkToken();
    if (args.pipeline) {
      // Get the pipeline URL from command line parameter
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
      // no pipeline URL from command line parameter, start the wizard
      const terminalInput = await Terminal.start();
      const host = terminalInput.host;
      pipelineId = terminalInput.pipelineId;
      projectId = terminalInput.projectId;
      initApi(host, token);
      await run();
    }
  }
})();
