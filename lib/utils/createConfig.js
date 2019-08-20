'use strict';

/* eslint-disable
  no-undefined
*/

const defaultTo = require('./defaultTo');

function createConfig(config, argv, { port }) {
  const firstWpOpt = Array.isArray(config) ? config[0] : config;
  const options = firstWpOpt.devServer || {};

  if (argv.bonjour) {
    options.bonjour = true;
  }

  if (argv.host) {
    options.host = argv.host;
  }

  if (argv.allowedHosts) {
    options.allowedHosts = argv.allowedHosts.split(',');
  }

  if (argv.public) {
    options.public = argv.public;
  }

  if (argv.socket) {
    options.socket = argv.socket;
  }

  if (argv.sockHost) {
    options.sockHost = argv.sockHost;
  }

  if (argv.sockPath) {
    options.sockPath = argv.sockPath;
  }

  if (argv.sockPort) {
    options.sockPort = argv.sockPort;
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

  if (argv.stdin) {
    options.stdin = true;
  }

  if (argv.hot) {
    options.hot = true;
  }

  if (argv.hotOnly) {
    options.hotOnly = true;
  }

  if (argv.clientLogLevel) {
    options.clientLogLevel = argv.clientLogLevel;
  }

  if (argv.watchContentBase) {
    options.watchContentBase = true;
  }

  if (
    typeof options.stats === 'object' &&
    typeof options.stats.colors === 'undefined' &&
    argv.color
  ) {
    options.stats = Object.assign({}, options.stats, { colors: argv.color });
  }

  if (argv.lazy) {
    options.lazy = true;
  }

  // TODO remove in `v4`
  if (!argv.info) {
    options.noInfo = true;
  }

  // TODO remove in `v4`
  if (argv.quiet) {
    options.quiet = true;
  }

  if (argv.https) {
    options.https = true;
  }

  if (argv.http2) {
    options.http2 = true;
  }

  if (argv.key) {
    options.key = argv.key;
  }

  if (argv.cert) {
    options.cert = argv.cert;
  }

  if (argv.cacert) {
    options.ca = argv.cacert;
  }

  if (argv.pfx) {
    options.pfx = argv.pfx;
  }

  if (argv.pfxPassphrase) {
    options.pfxPassphrase = argv.pfxPassphrase;
  }

  if (argv.inline === false) {
    options.inline = false;
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
    options.openPage = argv.openPage;
  }

  if (argv.open !== undefined) {
    options.open = argv.open;
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
