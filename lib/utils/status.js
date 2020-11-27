'use strict';

const colors = require('./colors');
const runOpen = require('./runOpen');

function status(uri, options, logger, useColor) {
  logger.info(`Project is running at ${colors.info(useColor, uri)}`);

  if (options.dev && options.dev.publicPath) {
    logger.info(
      `webpack output is served from ${colors.info(
        useColor,
        options.dev.publicPath
      )}`
    );
  }

  if (options.static && options.static.length > 0) {
    logger.info(
      `Content not from webpack is served from ${colors.info(
        useColor,
        options.static.map((staticOption) => staticOption.directory).join(', ')
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
