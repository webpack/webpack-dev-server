'use strict';

/* eslint-disable
  no-undefined
*/

function normalizeOptions(options) {
  options.hot =
    typeof options.hot === 'boolean' || options.hot === 'only'
      ? options.hot
      : true;

  options.disableHostCheck =
    typeof options.disableHostCheck === 'boolean'
      ? options.disableHostCheck
      : false;

  options.serveIndex =
    typeof options.serveIndex === 'boolean' ? options.serveIndex : true;

  options.contentBase =
    typeof options.contentBase !== 'undefined'
      ? options.contentBase
      : process.cwd();

  options.contentBasePublicPath = options.contentBasePublicPath || '/';

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

  options.heartbeatInterval = 30000;

  // Replace leading and trailing slashes to normalize path
  options.sockPath = `/${
    options.sockPath ? options.sockPath.replace(/^\/|\/$/g, '') : 'ws'
  }`;

  options.watchOptions =
    typeof options.watchOptions !== 'undefined' ? options.watchOptions : {};
}

module.exports = normalizeOptions;
