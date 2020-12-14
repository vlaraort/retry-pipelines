# retry pipelines

Basic node script to retry gitlab pipelines, this is created due to pipeline inestability in some companies, to avoid developers to be checking and relaunching jobs manually when then things are unestable.

You need to add a `vault.js` file like this in the root of the project, with your token and the host of your gitlab instance

```js
exports.token = "mytoken";
exports.host = "https://gitlab.mycompany.net";
```

and in the `index.js` file, edit the `projectId` and `pipelineId` variables with the pipeline data that you want to check.

## Installation

`npm install`

## Run

`npm start`