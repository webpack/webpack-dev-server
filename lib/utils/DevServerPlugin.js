'use strict';

const webpack = require('webpack');
const createDomain = require('./createDomain');
const getSocketClientPath = require('./getSocketClientPath');

// @ts-ignore
const EntryPlugin = webpack.EntryPlugin;

class DevServerPlugin {
  /**
   * @param {?Object} options - Dev-Server options
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * A Entry, it can be of type string or string[] or Object<string | string[],string>
   * @typedef {(string[] | string | Object<string | string[],string>)} Entry
   */

  /**
   * Apply the plugin
   * @param {Object} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    const { options } = this;

    /** @type {string} */
    const domain = createDomain(options);
    /** @type {string} */
    const host =
      options.client && options.client.host
        ? `&host=${options.client.host}`
        : '';
    /** @type {string} */
    let path = '';
    // only add the path if it is not default
    if (
      options.client &&
      options.client.path &&
      options.client.path !== '/ws'
    ) {
      path = `&path=${options.client.path}`;
    }
    /** @type {string} */
    const port =
      options.client && options.client.port
        ? `&port=${options.client.port}`
        : '';
    /** @type {string} */
    const clientEntry = `${require.resolve(
      '../../client/default/'
    )}?${domain}${host}${path}${port}`;

    /** @type {(string[] | string)} */
    let hotEntry;

    if (options.hot === 'only') {
      hotEntry = require.resolve('webpack/hot/only-dev-server');
    } else if (options.hot) {
      hotEntry = require.resolve('webpack/hot/dev-server');
    }
    /**
     * prependEntry Method for webpack 4
     * @param {Entry} originalEntry
     * @param {Entry} additionalEntries
     * @returns {Entry}
     */
    const prependEntry = (originalEntry, additionalEntries) => {
      if (typeof originalEntry === 'function') {
        return () =>
          Promise.resolve(originalEntry()).then((entry) =>
            prependEntry(entry, additionalEntries)
          );
      }

      if (typeof originalEntry === 'object' && !Array.isArray(originalEntry)) {
        /** @type {Object<string,string>} */
        const clone = {};

        Object.keys(originalEntry).forEach((key) => {
          // entry[key] should be a string here
          const entryDescription = originalEntry[key];
          clone[key] = prependEntry(entryDescription, additionalEntries);
        });

        return clone;
      }

      // in this case, entry is a string or an array.
      // make sure that we do not add duplicates.
      /** @type {Entry} */
      const entriesClone = additionalEntries.slice(0);
      [].concat(originalEntry).forEach((newEntry) => {
        if (!entriesClone.includes(newEntry)) {
          entriesClone.push(newEntry);
        }
      });
      return entriesClone;
    };

    /**
     *
     * Description of the option for checkInject method
     * @typedef {Function} checkInjectOptionsParam
     * @param {Object} _config - compilerConfig
     * @return {Boolean}
     */

    /**
     *
     * @param {Boolean | checkInjectOptionsParam} option - inject(Hot|Client) it is Boolean | fn => Boolean
     * @param {Object} _config
     * @param {Boolean} defaultValue
     * @return {Boolean}
     */
    // eslint-disable-next-line no-shadow
    const checkInject = (option, _config, defaultValue) => {
      if (typeof option === 'boolean') return option;
      if (typeof option === 'function') return option(_config);
      return defaultValue;
    };

    const compilerOptions = compiler.options;
    compilerOptions.plugins = compilerOptions.plugins || [];
    /** @type {Boolean} */
    const isWebTarget = compilerOptions.externalsPresets
      ? compilerOptions.externalsPresets.web
      : [
          'web',
          'webworker',
          'electron-renderer',
          'node-webkit',
          // eslint-disable-next-line no-undefined
          undefined,
          null,
        ].includes(compilerOptions.target);
    /** @type {Entry} */
    const additionalEntries = checkInject(
      options.injectClient,
      compilerOptions,
      isWebTarget
    )
      ? [clientEntry]
      : [];

    if (hotEntry && checkInject(options.injectHot, compilerOptions, true)) {
      additionalEntries.push(hotEntry);
    }

    // use a hook to add entries if available
    if (EntryPlugin) {
      compiler.hooks.make.tapPromise('DevServerPlugin', (compilation) =>
        Promise.all(
          additionalEntries.map(
            (entry) =>
              new Promise((resolve, reject) => {
                compilation.addEntry(
                  compiler.context,
                  EntryPlugin.createDependency(entry, {}),
                  {}, // global entry
                  (err) => {
                    if (err) return reject(err);
                    resolve();
                  }
                );
              })
          )
        )
      );
    } else {
      compilerOptions.entry = prependEntry(
        compilerOptions.entry || './src',
        additionalEntries
      );
      compiler.hooks.entryOption.call(
        compilerOptions.context,
        compilerOptions.entry
      );
    }

    const providePlugin = new webpack.ProvidePlugin({
      __webpack_dev_server_client__: getSocketClientPath(options),
    });
    providePlugin.apply(compiler);

    if (
      hotEntry &&
      !compilerOptions.plugins.find(
        (p) => p.constructor === webpack.HotModuleReplacementPlugin
      )
    ) {
      // apply the HMR plugin, if it didn't exist before.
      const plugin = new webpack.HotModuleReplacementPlugin();
      plugin.apply(compiler);
    }
  }
}

module.exports = DevServerPlugin;
