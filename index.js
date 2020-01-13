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

    const commitlist = await octokit.repos.listCommits({
      owner,
      repo
    });
    console.log(commitlist)

    const run_list = mylist.data.check_runs
    var x;
    var body = "### Workflows & Completion Times\n"
    for (x of run_list.reverse()) {
      started = new Date(x.started_at);
      completed = new Date(x.completed_at);
      if (x.completed_at == null) {
        uptime = (Date.now() - started.getTime()) / 1000;
      } else {
        uptime = (completed.getTime() - started.getTime()) / 1000;
      }
      body += `**${x.name}** completed after _${uptime} seconds_\n`;
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
