'use strict';

const path = require('path');
const execa = require('execa');

const webpackDevServerPath = path.resolve(
  __dirname,
  '../../bin/webpack-dev-server.js'
);
const basicConfigPath = path.resolve(
  __dirname,
  '../fixtures/cli/webpack.config.js'
);

function runWebackDevServer(testArgs, configPath) {
  const cwd = process.cwd();
  const env = process.env.NODE_ENV;
  let stdout = '';
  let stderr = '';

  if (!configPath) {
    configPath = basicConfigPath;
  }

  if (!testArgs) {
    testArgs = [];
  } else if (typeof testArgs === 'string') {
    testArgs = testArgs.split(' ');
  }

  const args = [webpackDevServerPath, '--config', configPath].concat(testArgs);

  return new Promise((resolve, reject) => {
    const child = execa('node', args, { cwd, env });

    child.on('error', (error) => reject(error));

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(stderr);
      }
      resolve({ stdout, stderr, code });
    });
  });
}

module.exports = runWebackDevServer;
