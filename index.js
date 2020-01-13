const core = require('@actions/core');
const os = require('os');
const github = require('@actions/github');

async function run() {
  try {
    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
    const ref = process.env.GITHUB_REF
    const commit_sha = process.env.GITHUB_SHA
    const mylist = await octokit.checks.listForRef({
      owner,
      repo,
      ref
    });
    const run_list = mylist.data.check_runs
    var x;
    var buildInfo = new Object()
    var body = "### Workflows & Completion Times\n"
    for (x of run_list.reverse()) {
      started = new Date(x.started_at);
      completed = new Date(x.completed_at);
      console.log(x.completed_at)
      if (x.completed_at == null) {
        uptime = (Date.now() - started.getTime()) / 1000;
      } else {
        uptime = (completed.getTime() - started.getTime()) / 1000;
      }
      body += `**${x.name}** completed after _${uptime} seconds_\n`;
    }

    console.log(buildInfo)
    octokit.repos.createCommitComment({
      owner,
      repo,
      commit_sha,
      body
    })
    core.setOutput('uptime', uptime);
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
