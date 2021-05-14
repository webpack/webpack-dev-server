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

  const normalizeTransportModeByType = (type, key) => {
    const defaultType = 'ws';
    const defaultOptions = { path: '/ws' };

    // The `transportMode` option is `undefined`
    if (typeof type === 'undefined') {
      return { type: defaultType, options: defaultOptions };
    }
    // `transportMode: 'ws'`
    else if (typeof type === 'string') {
      return { type: type || defaultType, options: defaultOptions };
    }
    // `transportMode: {}`
    else if (typeof type[key] === 'undefined') {
      return { type: defaultType, options: defaultOptions };
    }
    // `transportMode: { server: 'ws' }`
    else if (typeof type[key] === 'string') {
      return { type: type[key], options: defaultOptions };
    }

    // `transportMode: { server: { type: 'ws', options: { path: '/ws' } } }`
    return {
      type: type[key].type || defaultType,
      options: { ...defaultOptions, ...type[key].options },
    };
  };

  options.transportMode = {
    server: normalizeTransportModeByType(options.transportMode, 'server'),
    client: normalizeTransportModeByType(options.transportMode, 'client'),
  };

  // console.log(options.transportMode);

  if (!options.client) {
    options.client = {};
  }

  // Enable client overlay by default
  if (typeof options.client.overlay === 'undefined') {
    options.client.overlay = true;
  }

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
