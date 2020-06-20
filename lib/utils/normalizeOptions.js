'use strict';

function normalizeOptions(compiler, options) {
  // Setup default value
  options.serveIndex =
    typeof options.serveIndex !== 'undefined' ? options.serveIndex : true;
  options.contentBase =
    typeof options.contentBase !== 'undefined'
      ? options.contentBase
      : process.cwd();
  options.contentBasePublicPath = options.contentBasePublicPath || '/';
  options.watchOptions = options.watchOptions || {};
  options.hot =
    typeof options.hot === 'boolean' || options.hot === 'only'
      ? options.hot
      : true;
  options.liveReload =
    typeof options.liveReload !== 'undefined' ? options.liveReload : true;
  options.stats =
    options.stats && Object.keys(options.stats).length !== 0
      ? options.stats
      : {};

  // normalize transportMode option
  if (typeof options.transportMode === 'undefined') {
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

  if (!options.client) {
    options.client = {};
  }

  options.client.path = `/${
    options.client.path ? options.client.path.replace(/^\/|\/$/g, '') : 'ws'
  }`;
}

module.exports = normalizeOptions;
