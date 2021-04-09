'use strict';

const path = require('path');
const isAbsoluteUrl = require('is-absolute-url');
const getCompilerConfigArray = require('./getCompilerConfigArray');

function normalizeOptions(compiler, options) {
  // TODO: improve this to not use .find for compiler watchOptions
  const configArr = getCompilerConfigArray(compiler);
  const watchOptionsConfig = configArr.find(
    (config) => config.watch !== false && config.watchOptions
  );
  const watchOptions = watchOptionsConfig
    ? watchOptionsConfig.watchOptions
    : {};

  const defaultOptionsForStatic = {
    directory: path.join(process.cwd(), 'public'),
    staticOptions: {},
    publicPath: ['/'],
    serveIndex: { icons: true },
    // Respect options from compiler watchOptions
    watch: watchOptions,
  };

  if (typeof options.static === 'undefined') {
    options.static = [defaultOptionsForStatic];
  } else if (typeof options.static === 'boolean') {
    options.static = options.static ? [defaultOptionsForStatic] : false;
  } else if (typeof options.static === 'string') {
    options.static = [
      { ...defaultOptionsForStatic, directory: options.static },
    ];
  } else if (Array.isArray(options.static)) {
    options.static = options.static.map((item) => {
      if (typeof item === 'string') {
        return { ...defaultOptionsForStatic, directory: item };
      }

      return { ...defaultOptionsForStatic, ...item };
    });
  } else {
    options.static = [{ ...defaultOptionsForStatic, ...options.static }];
  }

  if (options.static) {
    options.static.forEach((staticOption) => {
      if (isAbsoluteUrl(staticOption.directory)) {
        throw new Error('Using a URL as static.directory is not supported');
      }

      // ensure that publicPath is an array
      if (typeof staticOption.publicPath === 'string') {
        staticOption.publicPath = [staticOption.publicPath];
      }

      // ensure that watch is an object if true
      if (staticOption.watch === true) {
        staticOption.watch = defaultOptionsForStatic.watch;
      }

      // ensure that serveIndex is an object if true
      if (staticOption.serveIndex === true) {
        staticOption.serveIndex = defaultOptionsForStatic.serveIndex;
      }
    });
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

  // Enable client overlay by default
  if (typeof options.client.overlay === 'undefined') {
    options.client.overlay = true;
  }

  options.client.path = `/${
    options.client.path ? options.client.path.replace(/^\/|\/$/g, '') : 'ws'
  }`;

  options.devMiddleware = options.devMiddleware || {};

  if (typeof options.firewall === 'undefined') {
    // firewall is enabled by default
    options.firewall = true;
  }

  if (typeof options.setupExitSignals === 'undefined') {
    options.setupExitSignals = true;
  }
}

module.exports = normalizeOptions;
