'use strict';

const { spawn } = require('child_process');

const [, , ...args] = process.argv;
const cwd = process.env.INIT_CWD;
spawn('node', ['../../../bin/webpack-dev-server.js', ...args], {
  cwd,
  stdio: 'inherit',
});
