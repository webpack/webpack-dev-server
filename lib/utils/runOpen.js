'use strict';

const open = require('opn');
const isAbsoluteUrl = require('is-absolute-url');

function runOpen(uri, options, log) {
  // https://github.com/webpack/webpack-dev-server/issues/1990
  let openOptions = { wait: false };
  let openMessage = 'Unable to open browser';

  if (typeof options.open === 'string') {
    openOptions = Object.assign({}, openOptions, { app: options.open });
    openMessage += `: ${options.open}`;
  }

  const pages =
    typeof options.openPage === 'string'
      ? [options.openPage]
      : options.openPage || [''];

  return Promise.all(
    pages.map((page) => {
      const pageUrl = page && isAbsoluteUrl(page) ? page : `${uri}${page}`;

      return open(pageUrl, openOptions).catch(() => {
        log.warn(
          `${openMessage}. If you are running in a headless environment, please do not use the --open flag`
        );
      });
    })
  );
}

module.exports = runOpen;
