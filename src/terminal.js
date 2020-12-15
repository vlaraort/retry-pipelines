const inquirer = require("inquirer");
const chalk = require("chalk");

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
}

function jobMessage(job) {
  switch (job.status) {
    case "success":
        return chalk.green(`[${job.stage.toUpperCase()}] ${job.name} => ${job.status}`)
    case "failed":
        return chalk.red(`[${job.stage.toUpperCase()}] ${job.name} => ${job.status}`)
    default:
        return chalk.yellow(`[${job.stage.toUpperCase()}] ${job.name} => ${job.status}`)

  }
}
module.exports = {
  start: async () => {
    const terminalOutput = await inquirer.prompt([
      {
        name: "pipelineUrl",
        type: "input",
        message: "Paste the URL of the pipeline:",
        validate: (answer) => {
          if (!isValidUrl(answer)) {
            return "please enter a valid URL";
          }
          return true;
        },
      },
    ]);
    const url = new URL(terminalOutput.pipelineUrl);
    const host = `${url.protocol}//${url.hostname}`;
    const path = url.pathname.split("/");
    const pipelineId = path[path.length - 1];
    const projectId = encodeURI(
      `${path[path.length - 4]}/${path[path.length - 3]}`
    );
    return { host, pipelineId, projectId };
  },

  printJobs: (jobs) => {

    console.clear();
    console.log("CURRENT PIPELINE STATUS");
    console.log("-----------------------");
    console.log("");
    jobs.forEach((job) => {
      console.log(jobMessage(job));
    });
    console.log("");
  },
};
