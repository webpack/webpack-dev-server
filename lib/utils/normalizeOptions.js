'use strict';

/* eslint-disable
  no-undefined
*/

function normalizeOptions(compiler, options) {
  // Setup default value
  options.contentBase =
    options.contentBase !== undefined ? options.contentBase : process.cwd();

  // set serverMode default
  if (options.serverMode === undefined) {
    options.serverMode = 'sockjs';
  }

  // set clientMode default
  if (options.clientMode === undefined) {
    options.clientMode = 'sockjs';
  }

  if (!options.watchOptions) {
    options.watchOptions = {};
  }
}

module.exports = normalizeOptions;
