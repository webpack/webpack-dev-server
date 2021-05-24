'use strict';

const webpack = require('webpack');
const createDomain = require('./createDomain');
const getSocketClientPath = require('./getSocketClientPath');

// @ts-ignore
const EntryPlugin = webpack.EntryPlugin;

class DevServerPlugin {
  /**
   * @param {?Object} options - Dev-Server options
   * @param {?Object} logger - Dev-Server logger
   */
  constructor(options, logger) {
    this.options = options;
    this.logger = logger;
  }

  /**
   * An Entry, it can be of type string or string[] or Object<string | string[],string>
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

    // SockJS is not supported server mode, so `host` and `port` can't specified, let's ignore them
    // TODO show warning about this
    const isSockJSType = options.webSocketServer.type === 'sockjs';

    /** @type {string} */
    let host = '';

    if (options.client && options.client.host) {
      host = `&host=${options.client.host}`;
    } else if (options.webSocketServer.options.host && !isSockJSType) {
      host = `&host=${options.webSocketServer.options.host}`;
    }

    /** @type {string} */
    let port = '';

    if (options.client && options.client.port) {
      port = `&port=${options.client.port}`;
    } else if (options.webSocketServer.options.port && !isSockJSType) {
      port = `&port=${options.webSocketServer.options.port}`;
    } else if (options.port) {
      port = `&port=${options.port}`;
    } else {
      port = '';
    }

    /** @type {string} */
    let path = '';

    // Only add the path if it is not default
    if (options.client && options.client.path && options.client.path) {
      path = `&path=${options.client.path}`;
    } else if (options.webSocketServer.options.path) {
      path = `&path=${options.webSocketServer.options.path}`;
    }

    /** @type {string} */
    const logging =
      options.client && options.client.logging
        ? `&logging=${options.client.logging}`
        : '';

    /** @type {string} */
    const clientEntry = `${require.resolve(
      '../../client/index.js'
    )}?${domain}${host}${path}${port}${logging}`;

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
      if (typeof option === 'boolean') {
        return option;
      }

      if (typeof option === 'function') {
        return option(_config);
      }

      return defaultValue;
    };

    const compilerOptions = compiler.options;

    compilerOptions.plugins = compilerOptions.plugins || [];

    /** @type {boolean} */
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
      options.client ? options.client.needClientEntry : null,
      compilerOptions,
      isWebTarget
    )
      ? [clientEntry]
      : [];

    if (
      hotEntry &&
      checkInject(
        options.client ? options.client.hotEntry : null,
        compilerOptions,
        true
      )
    ) {
      additionalEntries.push(hotEntry);
    }

    if (!isWebTarget) {
      this.logger.info(`A non-web target was selected in dev server config.`);
      if (this.options.liveReload) {
        this.logger.warn(`Live reload will not work with a non-web target.`);
      }
    }

    // use a hook to add entries if available
    if (EntryPlugin) {
      for (const additionalEntry of additionalEntries) {
        new EntryPlugin(compiler.context, additionalEntry, {
          // eslint-disable-next-line no-undefined
          name: undefined,
        }).apply(compiler);
      }
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
