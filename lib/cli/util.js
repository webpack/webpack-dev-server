'use strict';

const chalk = require('chalk');
const opn = require('opn');
const log = require('../log');

function broadcastZeroConf(options) {
  const bonjour = require('bonjour')(); // eslint-disable-line global-require
  bonjour.publish({
    name: 'Webpack Dev Server',
    port: options.port,
    type: 'http',
    subtypes: ['webpack']
  });
  process.on('exit', () => {
    bonjour.unpublishAll(() => {
      bonjour.destroy();
    });
  });
}

function open(options, uri) {
  if (options.open) {
    let openOptions = {};
    let openMessage = 'Unable to open browser';

    if (typeof options.open === 'string') {
      openOptions = { app: options.open };
      openMessage += `: ${options.open}`;
    }

    opn(uri + (options.openPage || ''), openOptions).catch(() => {
      // eslint-disable-next-line no-console
      log.error(`${openMessage}. If you are running in a headless environment, please do not use the open flag.`);
    });
  }
}

function ready(argv, options, uri) {
  const contentBase = Array.isArray(options.contentBase) ? options.contentBase.join(', ') : options.contentBase;

  chalk.enabled = argv.color;

  if (!options.quiet) {
    let start = chalk`Project is running at {blue ${uri}}`;

    if (options.socket) {
      start = `Listening to socket at {blue ${options.socket}}`;
    }

    if (argv.progress) {
      log();
    }

    log.info(start);
    log.info(chalk`webpack output is served from {blue ${options.publicPath}}`);

    if (contentBase) {
      log.info(chalk`Content not from webpack is served from {blue ${contentBase}}`);
    }

    if (options.historyApiFallback) {
      const fallback = options.historyApiFallback.index || '/index.html';
      log.info(chalk`404s will fallback to {blue ${fallback}}`);
    }

    if (options.bonjour) {
      log.info('Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)');
    }
  }

  open(options, uri);
}

module.exports = { ready, open, broadcastZeroConf };
