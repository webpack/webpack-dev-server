#!/usr/bin/env node

'use strict';

require('./lib/polyfills');
require('loud-rejection/register');

const convertArgv = require('webpack/bin/convert-argv');
const debug = require('debug')('wds');
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

const webpackOptions = convertArgv(yargs, argv, {
  outputFilename: '/bundle.js'
});

options(argv, webpackOptions).then((devServerOptions) => {
  start(argv, devServerOptions, webpackOptions);
});
