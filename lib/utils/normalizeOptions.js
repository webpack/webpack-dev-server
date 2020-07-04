'use strict';

function normalizeOptions(compiler, options) {
  // Setup default value
  const defaultStaticDirectory = process.cwd();

  if (typeof options.static === 'undefined' || options.static === true) {
    options.static = {
      directory: defaultStaticDirectory,
    };
  } else if (typeof options.static === 'string') {
    options.static = {
      directory: options.static,
    };
  } else if (
    typeof options.static === 'object' &&
    options.static instanceof Array
  ) {
    // what should be done with the array?
  }

  // options.static is now either an object (with directory property set) or false
  if (options.static) {
    options.static.serveIndex =
      typeof options.static.serveIndex !== 'undefined'
        ? options.static.serveIndex
        : true;

    options.static.publicPath = options.static.publicPath || '/';

    if (
      typeof options.static.watch === 'undefined' ||
      options.static.watch === true
    ) {
      options.static.watch = {};
    }
  }

  options.hot =
    typeof options.hot === 'boolean' || options.hot === 'only'
      ? options.hot
      : true;
  options.liveReload =
    typeof options.liveReload !== 'undefined' ? options.liveReload : true;

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

  options.dev = options.dev || {};
}

module.exports = normalizeOptions;
