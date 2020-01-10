const core = require('@actions/core');
const os = require('os');
const github = require('@actions/github');

async function run() {
  try {
    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);
    const uptime = os.uptime();
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
    const ref = process.env.GITHUB_REF
    octokit.checks.listForRef({
      owner,
      repo,
      ref      
    });
    console.log(`Uptime is ${uptime} seconds ...`);
    core.setOutput('uptime', uptime);
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
