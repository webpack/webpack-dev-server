'use strict';

const path = require('path');
const { defaultTo } = require('../../bin/utils');

function createConfig(config, argv, { port }) {
  const firstWpOpt = Array.isArray(config) ? config[0] : config;
  const options = firstWpOpt.devServer || {};

  // This updates both config and firstWpOpt
  firstWpOpt.mode = defaultTo(firstWpOpt.mode, 'development');

  if (argv.bonjour) {
    options.bonjour = true;
  }

  if (argv.host !== 'localhost' || !options.host) {
    options.host = argv.host;
  }

  if (argv['allowed-hosts']) {
    options.allowedHosts = argv['allowed-hosts'].split(',');
  }

  if (argv.public) {
    options.public = argv.public;
  }

  if (argv.socket) {
    options.socket = argv.socket;
  }

  if (argv.progress) {
    options.progress = argv.progress;
  }

  if (!options.publicPath) {
    // eslint-disable-next-line
    options.publicPath =
      (firstWpOpt.output && firstWpOpt.output.publicPath) || '';

    if (
      !/^(https?:)?\/\//.test(options.publicPath) &&
      options.publicPath[0] !== '/'
    ) {
      options.publicPath = `/${options.publicPath}`;
    }
  }

  if (!options.filename) {
    options.filename = firstWpOpt.output && firstWpOpt.output.filename;
  }

  if (!options.watchOptions) {
    options.watchOptions = firstWpOpt.watchOptions;
  }

  if (argv.stdin) {
    process.stdin.on('end', () => {
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    });

    process.stdin.resume();
  }

  if (!options.hot) {
    options.hot = argv.hot;
  }

  if (!options.hotOnly) {
    options.hotOnly = argv['hot-only'];
  }

  if (!options.clientLogLevel) {
    options.clientLogLevel = argv['client-log-level'];
  }

  // eslint-disable-next-line
  if (options.contentBase === undefined) {
    if (argv['content-base']) {
      options.contentBase = argv['content-base'];

      if (Array.isArray(options.contentBase)) {
        options.contentBase = options.contentBase.map((p) => path.resolve(p));
      } else if (/^[0-9]$/.test(options.contentBase)) {
        options.contentBase = +options.contentBase;
      } else if (!/^(https?:)?\/\//.test(options.contentBase)) {
        options.contentBase = path.resolve(options.contentBase);
      }
      // It is possible to disable the contentBase by using
      // `--no-content-base`, which results in arg["content-base"] = false
    } else if (argv['content-base'] === false) {
      options.contentBase = false;
    }
  }

  if (argv['watch-content-base']) {
    options.watchContentBase = true;
  }

  if (!options.stats) {
    options.stats = {
      cached: false,
      cachedAssets: false,
    };
  }

  if (
    typeof options.stats === 'object' &&
    typeof options.stats.colors === 'undefined'
  ) {
    options.stats = Object.assign({}, options.stats, { colors: argv.color });
  }

  if (argv.lazy) {
    options.lazy = true;
  }

  if (!argv.info) {
    options.noInfo = true;
  }

  if (argv.quiet) {
    options.quiet = true;
  }

  if (argv.https) {
    options.https = true;
  }

  if (argv['pfx-passphrase']) {
    options.pfxPassphrase = argv['pfx-passphrase'];
  }

  if (argv.inline === false) {
    options.inline = false;
  }

  if (argv['history-api-fallback']) {
    options.historyApiFallback = true;
  }

  if (argv.compress) {
    options.compress = true;
  }

  if (argv['disable-host-check']) {
    options.disableHostCheck = true;
  }

  if (argv['open-page']) {
    options.open = true;
    options.openPage = argv['open-page'];
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
