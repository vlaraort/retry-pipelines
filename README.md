# retry pipelines

Basic node script to retry gitlab pipelines, this is created due to pipeline inestability in some companies, to avoid developers to be checking and relaunching jobs manually when then things are unestable.

You need to add a `vault.js` file like this in the root of the project, with your gitlab token generated in the following URL `https://gitlab.mycompany.net/profile/personal_access_tokens`

```js
exports.token = "mytoken";
```

## Installation

- clone the repository
- `npm install`

## Run

`npm start`