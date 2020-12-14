const { Gitlab } = require("@gitbeaker/node");
const { token, host } = require('./vault.js');

// Edit this variables to match your pipeline
const projectId = "59108";
const pipelineId = "3186956";

const api = new Gitlab({
  host,
  token,
  rejectUnauthorized: false,
});

const getPipelineData = async () => {
  const pipelineInfo = await api.Pipelines.show(projectId, pipelineId);
  return pipelineInfo;
};

const retryPipeline = async () => {
  const pipelineInfo = await api.Pipelines.retry(projectId, pipelineId);
  return pipelineInfo;
};

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  async function run() {
    const pipelineData = await getPipelineData();

    if (pipelineData.status === "running") {
      console.log("Pipeline running, waiting one minute to recheck status");
      // retry in 1 minute
      await sleep(60000)
      await run();
      
    }
    else if (pipelineData.status === "failed") {
      console.log("Pipeline failed!, retrying...");
      await retryPipeline()
      console.log("Retried")
      await sleep(6000)
      await run();
    } else {
      console.log(`Pipeline in status ${pipelineData.status}, finishing the loop.`);

    }
  }

  await run()
})();
