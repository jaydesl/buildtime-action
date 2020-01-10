const core = require('@actions/core');

async function run() {
  try { 
    const uptime = process.uptime();
    console.log(`Uptime is ${uptime} seconds ...`)
    core.setOutput('uptime', uptime);
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
