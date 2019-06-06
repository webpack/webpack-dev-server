'use strict';

const open = require('opn');

function runOpen(uri, options, log) {
  let openOptions = {};
  let openMessage = 'Unable to open browser';

  if (typeof options.open === 'string') {
    openOptions = { app: options.open };
    openMessage += `: ${options.open}`;
  }

  return open(`${uri}${options.openPage || ''}`, openOptions).catch(() => {
    log.warn(
      `${openMessage}. If you are running in a headless environment, please do not use the --open flag`
    );
  });
}

module.exports = runOpen;
