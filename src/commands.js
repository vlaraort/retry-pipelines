const commander = require("commander");
const program = new commander.Command();

const getArgs = () => {
  program
    .option("-rt, --reset-token", "Reset the stored Gitlab token")
    .option("-p, --pipeline <url>", "URL of the pipeline");

  program.parse(process.argv);
  return program;
}

exports.getArgs = getArgs;