'use strict';

const webpack = require('webpack');
const addEntries = require('./addEntries');
const getSocketClientPath = require('./getSocketClientPath');

function updateCompiler(compiler, options) {
  const findHMRPlugin = (config) => {
    if (!config.plugins) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }

    return config.plugins.find(
      (plugin) => plugin.constructor === webpack.HotModuleReplacementPlugin
    );
  };

  const compilers = [];
  const compilersWithoutHMR = [];
  if (compiler.compilers) {
    // eslint-disable-next-line no-shadow
    compiler.compilers.forEach((compiler) => {
      compilers.push(compiler);
      if (!findHMRPlugin(compiler.options)) {
        compilersWithoutHMR.push(compiler);
      }
    });
  } else {
    compilers.push(compiler);
    if (!findHMRPlugin(compiler.options)) {
      compilersWithoutHMR.push(compiler);
    }
  }

  // it's possible that we should clone the config before doing
  // this, but it seems safe not to since it actually reflects
  // the changes we are making to the compiler
  // important: this relies on the fact that addEntries now
  // prevents duplicate new entries.
  const closeCallback = addEntries(compiler, options);
  // eslint-disable-next-line no-shadow
  compilers.forEach((compiler) => {
    const providePlugin = new webpack.ProvidePlugin({
      __webpack_dev_server_client__: getSocketClientPath(options),
    });
    providePlugin.apply(compiler);
  });

  // do not apply the plugin unless it didn't exist before.
  if (options.hot === true || options.hot === 'only') {
    // eslint-disable-next-line no-shadow
    compilersWithoutHMR.forEach((compiler) => {
      // addDevServerEntrypoints above should have added the plugin
      // to the compiler options
      const plugin = findHMRPlugin(compiler.options);
      if (plugin) {
        plugin.apply(compiler);
      }
    });
  }

  return closeCallback;
}

module.exports = updateCompiler;
