#!/usr/bin/env node

'use strict';

require('./lib/polyfills');
require('loud-rejection/register');

const convertArgv = require('webpack/bin/convert-argv');
const debug = require('debug')('webpack-dev-server');
const importLocal = require('import-local');
const updateNotifier = require('update-notifier');
const { argv, yargs } = require('./lib/cli/flags');
const options = require('./lib/cli/options');
const start = require('./lib/cli/start');
const pkg = require('./package.json');

// Prefer the local installation of webpack-dev-server
if (importLocal(__filename)) {
  debug('Using local install of webpack-dev-server');
  return;
}

updateNotifier({ pkg }).notify();

const webpackOpts = convertArgv(yargs, argv, {
  outputFilename: '/bundle.js'
});

options(argv, webpackOpts).then((result) => {
  const { devServerOptions, log, webpackOptions } = result;
  start(argv, devServerOptions, log, webpackOptions);
});
