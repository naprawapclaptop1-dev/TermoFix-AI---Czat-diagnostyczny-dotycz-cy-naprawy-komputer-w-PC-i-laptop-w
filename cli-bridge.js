#!/usr/bin/env node
/**
 * TermoFix AI Workstation CLI Bridge (cli-bridge.exe / cli-bridge.js)
 * Connects directly to TermoFix AI UI and executes system commands (dir, taskkill, sfc /scannow, wmic)
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

console.log('====================================================');
console.log(' TermoFix AI - Console System Bridge (cli-bridge.exe)');
console.log(' Status: Ready for commands from TermoFix UI / Chat');
console.log('====================================================');

function executeCommand(commandStr) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ command: commandStr });

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/cli-bridge/execute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve({ success: true, output: body });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message, output: `[CLI Bridge] Offline local response for "${commandStr}"` });
    });

    req.write(postData);
    req.end();
  });
}

// Process command line args if provided
const args = process.argv.slice(2);
if (args.length > 0) {
  const cmd = args.join(' ');
  executeCommand(cmd).then(res => {
    console.log(`\n> ${cmd}\n`);
    console.log(res.output || res.error);
    process.exit(0);
  });
}
