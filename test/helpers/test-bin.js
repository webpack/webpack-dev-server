'use strict';

const path = require('path');
const { spawn } = require('child_process');
const execa = require('execa');

const webpackDevServerPath = path.resolve(
  __dirname,
  '../../bin/webpack-dev-server.js'
);
const basicConfigPath = path.resolve(
  __dirname,
  '../fixtures/cli/webpack.config.js'
);

function testBin(testArgs, configPath, useSpawn) {
  const cwd = process.cwd();
  const env = process.env.NODE_ENV;

  if (!configPath) {
    configPath = basicConfigPath;
  }

  if (!testArgs) {
    testArgs = [];
  } else if (typeof testArgs === 'string') {
    testArgs = testArgs.split(' ');
  }

  const args = [webpackDevServerPath, '--config', configPath].concat(testArgs);

  const opts = { cwd, env, timeout: 10000 };
  let execLib = execa;
  // use Node's spawn as a workaround for execa issues
  // https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
  if (useSpawn) {
    execLib = spawn;
    delete opts.timeout;
  }

  return execLib('node', args, opts);
}

module.exports = testBin;
