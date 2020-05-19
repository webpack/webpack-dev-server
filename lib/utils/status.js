'use strict';

const colors = require('./colors');
const runOpen = require('./runOpen');

// TODO: don't emit logs when webpack-dev-server is used via Node.js API
function status(uri, options, logger, useColor) {
  const contentBase = Array.isArray(options.contentBase)
    ? options.contentBase.join(', ')
    : options.contentBase;

  if (options.socket) {
    logger.info(
      `Listening to socket at ${colors.info(useColor, options.socket)}`
    );
  } else {
    logger.info(`Project is running at ${colors.info(useColor, uri)}`);
  }

  logger.info(
    `webpack output is served from ${colors.info(useColor, options.publicPath)}`
  );

  if (contentBase) {
    logger.info(
      `Content not from webpack is served from ${colors.info(
        useColor,
        contentBase
      )}`
    );
  }

  if (options.historyApiFallback) {
    logger.info(
      `404s will fallback to ${colors.info(
        useColor,
        options.historyApiFallback.index || '/index.html'
      )}`
    );
  }

  if (options.bonjour) {
    logger.info(
      'Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)'
    );
  }

  if (options.open) {
    runOpen(uri, options, logger);
  }
}

module.exports = status;
