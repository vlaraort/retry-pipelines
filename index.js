const { Gitlab } = require("@gitbeaker/node");
const { token, host } = require('./vault.js');

const projectId = "59108";
const pipelineId = "3186956";

const RESULTS_NUMBER = 20;

const api = new Gitlab({
  host,
  token,
  rejectUnauthorized: false,
});

const getPipelineData = async () => {
  const pipelineInfo = await api.Pipelines.show(projectId, pipelineId);
  return pipelineInfo;
};

const getPipelineJobs = async () => {
  const pipelineJobs = await api.Pipelines.showJobs(projectId, pipelineId);
  return pipelineJobs;
};

const retryPipeline = async () => {
  const pipelineInfo = await api.Pipelines.retry(projectId, pipelineId);
  return pipelineInfo;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  async function run() {
    const pipelineData = await getPipelineData();
    // if(pipelineData.status === "running" || pipelineData.status === "failed") {
    //   const pipelineJobs = await getPipelineJobs();
    //   const failedJobs = pipelineJobs.filter(job => job.status === 'failed')
    //   console.log(failedJobs)
    // }

    if (pipelineData.status === "running") {
      console.log("Pipeline running, waiting one minute to recheck status");
      await sleep(60000)
      await run();
      // retry in 1 minute
    }
    if (pipelineData.status === "failed") {
      console.log("Pipeline failed!, retrying...");

      const retryData = await retryPipeline()
      // console.log(retryData)
      console.log("Retryied")
      await sleep(6000)
      await run();
    }
  }

  await run()
})();
