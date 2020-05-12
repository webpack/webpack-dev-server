'use strict';

/* eslint-disable
  no-undefined
*/

function normalizeOptions(compiler, options) {
  // Setup default value
  options.contentBase =
    options.contentBase !== undefined ? options.contentBase : process.cwd();
  options.contentBasePublicPath = options.contentBasePublicPath || '/';
  options.hot =
    typeof options.hot === 'boolean' || options.hot === 'only'
      ? options.hot
      : true;
  options.serveIndex =
    options.serveIndex !== undefined ? options.serveIndex : true;
  options.watchOptions = options.watchOptions || {};
  options.stats =
    options.stats && Object.keys(options.stats).length !== 0
      ? options.stats
      : {};

  // normalize transportMode option
  if (options.transportMode === undefined) {
    options.transportMode = {
      server: 'ws',
      client: 'ws',
    };
  } else {
    switch (typeof options.transportMode) {
      case 'string':
        options.transportMode = {
          server: options.transportMode,
          client: options.transportMode,
        };
        break;
      // if not a string, it is an object
      default:
        options.transportMode.server = options.transportMode.server || 'ws';
        options.transportMode.client = options.transportMode.client || 'ws';
    }
  }

  if (!options.watchOptions) {
    options.watchOptions = {};
  }

  if (!options.clientOptions) {
    options.clientOptions = {};
  }

  options.clientOptions.path = `/${
    options.clientOptions.path
      ? options.clientOptions.path.replace(/^\/|\/$/g, '')
      : 'ws'
  }`;
}

module.exports = normalizeOptions;
