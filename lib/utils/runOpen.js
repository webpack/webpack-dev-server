'use strict';

const open = require('opn');

function handleInvalidOptionsConfig(log, optionsConfig) {
  log.warn('You have passed in an invalid options config');
  log.info('For more on open see https://github.com/sindresorhus/open');
  log.info('You passed in ', optionsConfig);
}

function runOpen(uri, options, log) {
  let openOptions = {};

  if (typeof options.open === 'string') {
    openOptions = { app: options.open };
  } else if (typeof options.open === 'object') {
    openOptions = options.open;
    if (!options.app && !options.wait) {
      handleInvalidOptionsConfig(log, options.open);
    }
  } else {
    handleInvalidOptionsConfig(log, options.open);
  }

  open(`${uri}${options.openPage || ''}`, openOptions).catch(() => {
    log.warn(
      'Unable to open browser. If you are running in a headless environment, please do not use the --open flag'
    );
  });
}

module.exports = runOpen;
