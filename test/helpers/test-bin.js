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

function testBin(testArgs, configPath) {
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

  return execa('node', args, { cwd, env, timeout: 10000 });
}

module.exports = testBin;
