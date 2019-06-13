'use strict';

/* eslint-disable
  no-shadow,
  no-undefined
*/
const webpack = require('webpack');
const addEntries = require('./addEntries');
const guid = require('./guid');

function updateCompiler(compiler, options) {
  if (options.inline !== false) {
    const findHMRPlugin = (config) => {
      if (!config.plugins) {
        return undefined;
      }

      return config.plugins.find(
        (plugin) => plugin.constructor === webpack.HotModuleReplacementPlugin
      );
    };

    const compilers = [];
    const compilersWithoutHMR = [];
    let webpackConfigs = [];
    if (compiler.compilers) {
      compiler.compilers.forEach((compiler) => {
        webpackConfigs.push(compiler.options);
        let name = compiler.options.name || guid();
        compiler.options.name = name;
        compilers.push(compiler);
        if (!findHMRPlugin(compiler.options)) {
          compilersWithoutHMR.push(compiler);
        }
      });
    } else {
      webpackConfigs = [compiler.options];
      let name = compiler.options.name || guid();
      compiler.options.name = name;
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
    for (let i = 0; i < compilers.length; i ++) {
      const compiler = compilers[i];
      const config = webpackConfigs[i];
      const compilerScopedOptions = {...options};
      compilerScopedOptions.sockPath = (options.sockPath || '') + compiler.options.name;
      addEntries(config, compilerScopedOptions);
    }
    compilers.forEach((compiler) => {
      const config = compiler.options;
      compiler.hooks.entryOption.call(config.context, config.entry);

      const providePlugin = new webpack.ProvidePlugin({
        // SockJSClient.getClientPath(options)
        __webpack_dev_server_client__: require.resolve(
          '../../client/clients/SockJSClient.js'
        ),
      });
      providePlugin.apply(compiler);
    });

    // do not apply the plugin unless it didn't exist before.
    if (options.hot || options.hotOnly) {
      compilersWithoutHMR.forEach((compiler) => {
        // addDevServerEntrypoints above should have added the plugin
        // to the compiler options
        const plugin = findHMRPlugin(compiler.options);
        if (plugin) {
          plugin.apply(compiler);
        }
      });
    }
  }
}

module.exports = updateCompiler;
