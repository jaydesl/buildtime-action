const core = require('@actions/core');
const os = require('os');
const github = require('@actions/github');

async function run() {
  try {
    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
    var ref = process.env.GITHUB_REF
    var head_sha = process.env.GITHUB_SHA
    const commit_sha = process.env.GITHUB_SHA
    if (ref.includes("pull")) {
      const mycommit = await octokit.repos.getCommit({
        owner,
        repo,
        ref
      });
      ref = mycommit.data.parents[0].sha
      head_sha = ref
    }
    console.log(ref)

    const mylist = await octokit.checks.listForRef({
      owner,
      repo,
      ref
    });

    const run_list = mylist.data.check_runs
    var workflow;
    var body = ""
    var check_run_id;
    for (workflow of run_list.reverse()) {
      started = new Date(workflow.started_at);
      completed = new Date(workflow.completed_at);
      if (workflow.completed_at == null) {
        uptime = (Date.now() - started.getTime()) / 1000;
      } else {
        uptime = (completed.getTime() - started.getTime()) / 1000;
      }
      body += `**${workflow.name}** completed after *${uptime} seconds*\n`;

      check_run_id = workflow.id;
    }
    var output = {};
    var name = "Workflow timings"
    var conclusion = "success"
    output.title = "Workflow times";
    output.summary = "### Provide a listing of workflows completed as part of this suite";
    output.text = body;
    await octokit.checks.create({
      owner,
      repo,
      name,
      head_sha,
      output,
      conclusion
    });

    const thisrun = await octokit.checks.get({
      owner,
      repo,
      check_run_id
    });
    console.log(thisrun)
    octokit.repos.createCommitComment({
      owner,
      repo,
      commit_sha,
      body
    });
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
