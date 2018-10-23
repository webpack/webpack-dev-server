'use strict';

const opn = require('opn');

function open(uri, options, log) {
  if (!options.open) {
    return;
  }

  let openOptions = {};
  let openMessage = 'Unable to open browser';

  if (typeof options.open === 'string') {
    openOptions = { app: options.open };
    openMessage += `: ${options.open}`;
  }

  opn(uri + (options.openPage || ''), openOptions).catch(() => {
    log.warn(
      `${openMessage}. If you are running in a headless environment, please do not use the --open flag`
    );
  });
}

module.exports = open;
