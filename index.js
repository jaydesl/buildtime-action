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

    const commitList = await octokit.repos.listCommitComments({
      owner,
      repo
    });
    console.log(commitList.data.sort(function(a,b){return a.created_at - b.created_at;}));

    const run_list = mylist.data.check_runs
    var workflow;
    var body = "### Workflows & Completion Times\n"
    for (workflow of run_list.reverse()) {
      started = new Date(workflow.started_at);
      completed = new Date(workflow.completed_at);
      if (workflow.completed_at == null) {
        uptime = (Date.now() - started.getTime()) / 1000;
      } else {
        uptime = (completed.getTime() - started.getTime()) / 1000;
      }
      body += `**${workflow.name}** completed after *${uptime} seconds*\n`;
    }
    octokit.repos.createCommitComment({
      owner,
      repo,
      commit_sha,
      body
    })
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
