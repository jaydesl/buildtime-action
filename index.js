const core = require('@actions/core');
const os = require('os');

async function run() {
  try { 
    const uptime = os.uptime();
    console.log(`Uptime is ${uptime} seconds ...`)
    core.setOutput('uptime', uptime);
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
