'use strict';

const { spawn } = require('child_process');

const cwd = process.env.INIT_CWD;
spawn('node', ['../../../bin/webpack-dev-server.js'], {
  cwd,
  stdio: 'inherit',
});
