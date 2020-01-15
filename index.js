const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const myToken = core.getInput('myToken');
    const octokit = new github.GitHub(myToken);
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")
    var ref = process.env.GITHUB_REF
    var head_sha = process.env.GITHUB_SHA
    if (process.env.GITHUB_EVENT_NAME.includes("pull")) {
      const mycommit = await octokit.repos.getCommit({
        owner,
        repo,
        ref
      });
      ref = mycommit.data.parents.pop().sha
      head_sha = ref
    }

    const mylist = await octokit.checks.listForRef({
      owner,
      repo,
      ref
    });
    const suites = await octokit.checks.listSuitesForRef({
      owner,
      repo,
      ref
    })

    const run_list = mylist.data.check_runs
    var workflow;
    var body = "";
    var suiteID = 0;
    console.log(suites.data.check_suites)
    core.info("testing core info log")
    for (workflow of run_list.reverse()) {
      if (workflow.name == "<WORKFLOW INFO>") {
        continue;
      }
      started = new Date(workflow.started_at);
      completed = new Date(workflow.completed_at);
      if (workflow.check_suite.id != suiteID) {
        suiteID = workflow.check_suite.id;
        body += `### Workflow started at ${new Date(workflow.started_at).toLocaleString()}\n`;
      }
      body += `[**${workflow.name}**](${workflow.html_url}) ${workflow.status}`;
      if (workflow.conclusion == null) {
        uptime = (Date.now() - started.getTime()) / 1000;
        body += ` after *${uptime} seconds*\n`;
      } else {
        uptime = (completed.getTime() - started.getTime()) / 1000;
        body += ` with ${workflow.conclusion} after *${uptime} seconds*\n`;
      }
      console.log(workflow)
      
    }
    var output = {};
    const name = "<WORKFLOW INFO>"
    const conclusion = "success"
    output.title = "Workflow info";
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
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
