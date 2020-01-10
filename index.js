const core = require('@actions/core');
const os = require('os');
const github = require('@actions/github');

async function run() {
  try {
    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
    const ref = process.env.GITHUB_REF
    const mylist = await octokit.checks.listForRef({
      owner,
      repo,
      ref      
    });
    const run_list = mylist.data.check_runs
    var x;
    var buildInfo = new Object()
    for (x of run_list) {
      started = new Date(x.started_at);
      completed = new Date(x.completed_at);
      console.log(completed)
      if (completed == "null") {
        continue;
      }
      uptime = (completed.getTime() - started.getTime()) / 1000;
      buildInfo[x.name] = uptime;
    }
    console.log(buildInfo)
   
    console.log(`buildtime is ${uptime} seconds ...`);
    
    core.setOutput('uptime', uptime);
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
