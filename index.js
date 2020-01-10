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
    const mylist = await octokit.checks.listForRef({
      owner,
      repo,
      ref      
    });
    started = mylist.data.check_runs.started_at
    uptime = (Date.now() - new Date(started).getTime()) / 1000
   
    console.log(`buildtime is ${uptime} seconds ...`);
    
    core.setOutput('uptime', uptime);
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
