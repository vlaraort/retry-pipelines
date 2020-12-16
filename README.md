# retry pipelines

Basic node script to retry gitlab pipelines, this is created due to pipeline inestability in some companies, to avoid developers to be checking and relaunching jobs manually when then things are unestable.

You need to add a valid Gitlab token, generate it from the Gitlab web page `https://gitlab.mycompany.net/profile/personal_access_tokens`, and run the package. It you messed it, you can reset the token with `retry-pipelines --reset-token`.

## Installation

- `npm install -g retry-pipelines`

## Run

run `retry-pipelines` or `rp` in your terminal

## Locally

- Clone the repository
- `npm install`
- `npm start`

## Help

run `retry-pipelines -help` in your terminal