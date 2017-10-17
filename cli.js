#!/usr/bin/env node

'use strict';

require('./lib/polyfills');
require('loud-rejection/register');

const convertArgv = require('webpack/bin/convert-argv');
const debug = require('debug')('xo');
const resolveCwd = require('resolve-cwd');
const updateNotifier = require('update-notifier');
const { argv, yargs } = require('./lib/cli/flags');
const options = require('./lib/cli/options');
const start = require('./lib/cli/start');
const pkg = require('./package.json');

const localCli = resolveCwd.silent('webpack-dev-server/cli');

// Prefer the local installation of webpack-dev-server
if (localCli && localCli !== __filename) {
  debug('Using local install of webpack-dev-server');
  // eslint-disable-next-line
  require(localCli);
  return;
}

updateNotifier({ pkg }).notify();

const webpackOpts = convertArgv(yargs, argv, {
  outputFilename: '/bundle.js'
});

options(argv, webpackOpts).then((result) => {
  const { devServerOptions, webpackOptions } = result;
  start(argv, devServerOptions, webpackOptions);
});
