'use strict';

const webpack = require('webpack');
const ipaddr = require('ipaddr.js');
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

    /** @type {"ws:" | "wss:" | "http:" | "https:" | "auto:"} */
    let protocol;

    // We are proxying dev server and need to specify custom `host`
    if (typeof options.client.webSocketURL.protocol !== 'undefined') {
      protocol = options.client.webSocketURL.protocol;
    } else {
      protocol = options.https ? 'wss:' : 'ws:';
    }

    /** @type {string} */
    let host;

    // SockJS is not supported server mode, so `host` and `port` can't specified, let's ignore them
    // TODO show warning about this
    const isSockJSType = options.webSocketServer.type === 'sockjs';

    // We are proxying dev server and need to specify custom `host`
    if (typeof options.client.webSocketURL.host !== 'undefined') {
      host = options.client.webSocketURL.host;
    }
    // Web socket server works on custom `host`, only for `ws` because `sock-js` is not support custom `host`
    else if (
      typeof options.webSocketServer.options.host !== 'undefined' &&
      !isSockJSType
    ) {
      host = options.webSocketServer.options.host;
    }
    // The `host` option is specified
    else if (typeof this.options.host !== 'undefined') {
      host = this.options.host;
    }
    // The `port` option is not specified
    else {
      host = '0.0.0.0';
    }

    /** @type {number | string} */
    let port;

    // We are proxying dev server and need to specify custom `port`
    if (typeof options.client.webSocketURL.port !== 'undefined') {
      port = options.client.webSocketURL.port;
    }
    // Web socket server works on custom `port`, only for `ws` because `sock-js` is not support custom `port`
    else if (
      typeof options.webSocketServer.options.port !== 'undefined' &&
      !isSockJSType
    ) {
      port = options.webSocketServer.options.port;
    }
    // The `port` option is specified
    else if (typeof options.port === 'number') {
      port = options.port;
    }
    // The `port` option is specified using `string`
    else if (typeof options.port === 'string' && options.port !== 'auto') {
      port = Number(options.port);
    }
    // The `port` option is not specified or set to `auto`
    else {
      port = 0;
    }

    /** @type {string} */
    let path = '';

    // We are proxying dev server and need to specify custom `path`
    if (typeof options.client.webSocketURL.path !== 'undefined') {
      path = options.client.webSocketURL.path;
    }
    // Web socket server works on custom `path`
    else if (
      typeof options.webSocketServer.options.prefix !== 'undefined' ||
      typeof options.webSocketServer.options.path !== 'undefined'
    ) {
      path =
        options.webSocketServer.options.prefix ||
        options.webSocketServer.options.path;
    }

    /** @type {Record<string, any>} */
    const searchParams = {};

    if (typeof options.client.logging !== 'undefined') {
      searchParams.logging = options.client.logging;
    }

    const webSocketURL = encodeURIComponent(
      new URL(
        `${protocol}//${ipaddr.IPv6.isIPv6(host) ? `[${host}]` : host}${
          port ? `:${port}` : ''
        }${path || '/'}${
          Object.keys(searchParams).length > 0
            ? `?${Object.entries(searchParams)
                .map(([key, value]) => `${key}=${value}`)
                .join('&')}`
            : ''
        }`
      ).toString()
    ).replace(
      /[!'()*]/g,
      (character) => `%${character.charCodeAt(0).toString(16)}`
    );

    /** @type {string} */
    const clientEntry = `${require.resolve(
      '../../client/index.js'
    )}?${webSocketURL}`;

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
