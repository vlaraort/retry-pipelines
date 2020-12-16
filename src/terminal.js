const inquirer = require("inquirer");
const chalk = require("chalk");
const { parsePipelineUrl, isValidUrl } = require("./pipelineUrlParser.js");

function jobMessage(job) {
  switch (job.status) {
    case "success":
      return chalk.green(
        `[${job.stage.toUpperCase()}] ${job.name} => ${job.status}`
      );
    case "failed":
      return chalk.red(
        `[${job.stage.toUpperCase()}] ${job.name} => ${job.status}`
      );
    default:
      return chalk.yellow(
        `[${job.stage.toUpperCase()}] ${job.name} => ${job.status}`
      );
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
    const { host, pipelineId, projectId } = parsePipelineUrl(
      terminalOutput.pipelineUrl
    );
    return { host, pipelineId, projectId };
  },

  startToken: async () => {
    const terminalOutput = await inquirer.prompt([
      {
        name: "token",
        type: "input",
        message: "No Gitlab token found, please enter a valid one:",
      },
    ]);
    const { token } = terminalOutput;
    return token;
  },

  resetToken: async () => {
    const terminalOutput = await inquirer.prompt([
      {
        name: "token",
        type: "input",
        message: "Enter a new Gitlab token:",
      },
    ]);
    const { token } = terminalOutput;
    return token;
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

  printPipelineArgError: () => {
    console.log(chalk.red("Not a valid pipeline URL"));
  },
};
