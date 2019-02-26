'use strict';

const open = require('opn');
const colors = require('./colors');

function status(uri, options, log, useColor) {
  const contentBase = Array.isArray(options.contentBase)
    ? options.contentBase.join(', ')
    : options.contentBase;

  if (options.socket) {
    log.info(`Listening to socket at ${colors.info(useColor, options.socket)}`);
  } else {
    log.info(`Project is running at ${colors.info(useColor, uri)}`);
  }

  log.info(
    `webpack output is served from ${colors.info(useColor, options.publicPath)}`
  );

  if (contentBase) {
    log.info(
      `Content not from webpack is served from ${colors.info(
        useColor,
        contentBase
      )}`
    );
  }

  if (options.historyApiFallback) {
    log.info(
      `404s will fallback to ${colors.info(
        useColor,
        options.historyApiFallback.index || '/index.html'
      )}`
    );
  }

  if (options.bonjour) {
    log.info(
      'Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)'
    );
  }

  if (options.open) {
    let openOptions = {};
    let openMessage = 'Unable to open browser';

    if (typeof options.open === 'string') {
      openOptions = { app: options.open };
      openMessage += `: ${options.open}`;
    }

    open(uri + (options.openPage || ''), openOptions).catch(() => {
      log.warn(
        `${openMessage}. If you are running in a headless environment, please do not use the --open flag`
      );
    });
  }
}

module.exports = status;
