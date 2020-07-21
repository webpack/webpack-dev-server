'use strict';

const path = require('path');
const isAbsoluteUrl = require('is-absolute-url');
const defaultTo = require('./defaultTo');

function createConfig(config, argv, { port }) {
  const firstWpOpt = Array.isArray(config) ? config[0] : config;
  const options = firstWpOpt.devServer || {};

  // This updates both config and firstWpOpt
  firstWpOpt.mode = defaultTo(firstWpOpt.mode, 'development');

  if (argv.bonjour) {
    options.bonjour = true;
  }

  if (argv.host && (argv.host !== 'localhost' || !options.host)) {
    options.host = argv.host;
  }

  if (argv.allowedHosts) {
    options.allowedHosts = argv.allowedHosts.split(',');
  }

  if (argv.public) {
    options.public = argv.public;
  }

  if (argv.liveReload === false) {
    options.liveReload = false;
  }

  if (argv.profile) {
    options.profile = argv.profile;
  }

  if (argv.progress) {
    options.progress = argv.progress;
  }

  if (argv.overlay) {
    options.overlay = argv.overlay;
  }

  options.dev = options.dev || {};

  if (!options.dev.publicPath) {
    options.dev.publicPath =
      (firstWpOpt.output && firstWpOpt.output.publicPath) || '';

    if (
      !isAbsoluteUrl(String(options.dev.publicPath)) &&
      options.dev.publicPath[0] !== '/'
    ) {
      options.dev.publicPath = `/${options.dev.publicPath}`;
    }
  }

  if (!options.watchOptions && firstWpOpt.watchOptions) {
    options.watchOptions = firstWpOpt.watchOptions;
  }

  if (argv.stdin) {
    process.stdin.on('end', () => {
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    });

    process.stdin.resume();
  }

  const hasHot = typeof argv.hot !== 'undefined';
  const hasHotOnly = typeof argv.hotOnly !== 'undefined';

  if (hasHot || hasHotOnly) {
    options.hot = hasHotOnly ? 'only' : argv.hot;
  }

  if (argv.clientLogging) {
    if (options.client) {
      options.client.logging = argv.clientLogging;
    } else {
      options.client = {
        logging: argv.clientLogging,
      };
    }
  }

  if (argv.contentBase) {
    options.contentBase = argv.contentBase;

    if (Array.isArray(options.contentBase)) {
      options.contentBase = options.contentBase.map((p) => path.resolve(p));
    } else if (/^[0-9]$/.test(options.contentBase)) {
      options.contentBase = +options.contentBase;
    } else if (!isAbsoluteUrl(String(options.contentBase))) {
      options.contentBase = path.resolve(options.contentBase);
    }
  }
  // It is possible to disable the contentBase by using
  // `--no-content-base`, which results in arg["content-base"] = false
  else if (argv.contentBase === false) {
    options.contentBase = false;
  }

  if (argv.watchContentBase) {
    options.watchContentBase = true;
  }

  if (argv.https) {
    options.https = true;
  }

  if (argv.http2) {
    options.http2 = true;
  }

  if (argv.historyApiFallback) {
    options.historyApiFallback = true;
  }

  if (argv.compress) {
    options.compress = true;
  }

  if (argv.disableHostCheck) {
    options.disableHostCheck = true;
  }

  if (argv.openPage) {
    options.open = true;
    options.openPage = argv.openPage.split(',');
  }

  if (typeof argv.open !== 'undefined') {
    options.open = argv.open !== '' ? argv.open : true;
  }

  if (options.open && !options.openPage) {
    options.openPage = '';
  }

  if (argv.useLocalIp) {
    options.useLocalIp = true;
  }

  // Kind of weird, but ensures prior behavior isn't broken in cases
  // that wouldn't throw errors. E.g. both argv.port and options.port
  // were specified, but since argv.port is 8080, options.port will be
  // tried first instead.
  options.port =
    argv.port === port
      ? defaultTo(options.port, argv.port)
      : defaultTo(argv.port, options.port);

  return options;
}

module.exports = createConfig;
