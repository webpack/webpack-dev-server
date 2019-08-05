'use strict';

/* eslint-disable
  no-undefined
*/

const path = require('path');
const isAbsoluteUrl = require('is-absolute-url');
const defaultTo = require('./defaultTo');

function normalizeOptions(compiler, options) {
  const firstWpOpt = compiler.compilers
    ? compiler.compilers[0].options
    : compiler.options;

  // defaultTo only returns the second parameter if the first is null or undefined
  firstWpOpt.mode = defaultTo(firstWpOpt.mode, 'development');

  const devServerOptions = firstWpOpt.devServer || {};

  // webpackOptions.devServer has the lowest priority here.
  // This is a breaking change for CLI, but a desired one.

  // For the API, it did not use webpackOptions.devServer in previous versions.
  // With these changes, API users, optimally, should do 1 of 3 things:
  // 1. Put all config in webpackOptions.devServer, then call: new Server(compiler, {});
  // 2. Put all config in webpackOptions.devServer, then call: new Server(compiler, webpackOptions.devServer);
  // 3. Put no config in webpackOptions.devServer, then call: new Server(compiler, options);

  // These are the recommended usage practices,
  // because it will cause no collision between webpackOptions.devServer and normal options

  // not using Object.assign because we want the current options object to remain,
  // but populate it with data from devServer if it does not already exist
  Object.keys(devServerOptions).forEach((key) => {
    if (options[key] === undefined) {
      options[key] = devServerOptions[key];
    }
  });

  if (!options.publicPath) {
    // eslint-disable-next-line
    options.publicPath =
      (firstWpOpt.output && firstWpOpt.output.publicPath) || '';
  }

  // moving this block out of the above (!options.publicPath) if statement
  // is a minor breaking change, but I think will make for better UX all around
  if (
    !isAbsoluteUrl(String(options.publicPath)) &&
    options.publicPath[0] !== '/'
  ) {
    options.publicPath = `/${options.publicPath}`;
  }

  if (!options.filename && firstWpOpt.output && firstWpOpt.output.filename) {
    options.filename = firstWpOpt.output && firstWpOpt.output.filename;
  }

  if (!options.watchOptions && firstWpOpt.watchOptions) {
    options.watchOptions = firstWpOpt.watchOptions;
  }

  // resolve paths if this is an array
  if (Array.isArray(options.contentBase)) {
    options.contentBase = options.contentBase.map((p) => {
      if (isAbsoluteUrl(p)) {
        return p;
      }

      return path.resolve(p);
    });
    // string that should be a number
    // TODO: remove ability to make contentBase a number
  } else if (
    typeof options.contentBase === 'string' &&
    /^[0-9]$/.test(options.contentBase)
  ) {
    options.contentBase = +options.contentBase;
    // resolve path if it is not absolute
  } else if (
    typeof options.contentBase === 'string' &&
    !isAbsoluteUrl(options.contentBase)
  ) {
    options.contentBase = path.resolve(options.contentBase);
  }

  if (!options.stats) {
    options.stats = defaultTo(firstWpOpt.stats, {
      cached: false,
      cachedAssets: false,
    });
  }

  // consider retrieving the webpack config's color option, and remove the dev server
  // CLI color option entirely.

  if (options.openPage) {
    options.open = true;
  }

  if (options.open !== undefined) {
    options.open = options.open !== '' ? options.open : true;
  }

  if (options.open && !options.openPage) {
    options.openPage = '';
  }

  // options that default to true:
  if (options.liveReload === undefined) {
    options.liveReload = true;
  }
  if (options.inline === undefined) {
    options.inline = true;
  }

  // ---- The options below were already here, they are not breaking changes ---- //

  // Setup default value
  options.contentBase =
    options.contentBase !== undefined ? options.contentBase : process.cwd();

  // normalize transportMode option
  if (options.transportMode === undefined) {
    options.transportMode = {
      server: 'sockjs',
      client: 'sockjs',
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
        options.transportMode.server = options.transportMode.server || 'sockjs';
        options.transportMode.client = options.transportMode.client || 'sockjs';
    }
  }

  if (!options.watchOptions) {
    options.watchOptions = {};
  }
}

module.exports = normalizeOptions;
