'use strict';

/**
 * An Entry, it can be of type string or string[] or Object<string | string[],string>
 * @typedef {(string[] | string | Object<string | string[],string>)} Entry
 */

class DevServerPlugin {
  /**
   * @param {Object} options - Dev-Server options
   */
  constructor(options) {
    this.options = options;
  }

  getWebsocketTransport() {
    let ClientImplementation;
    let clientImplementationFound = true;

    const isKnownWebSocketServerImplementation =
      typeof this.options.webSocketServer.type === 'string' &&
      (this.options.webSocketServer.type === 'ws' ||
        this.options.webSocketServer.type === 'sockjs');

    let clientTransport;

    if (typeof this.options.client.transport !== 'undefined') {
      clientTransport = this.options.client.transport;
    } else if (isKnownWebSocketServerImplementation) {
      clientTransport = this.options.webSocketServer.type;
    }

    switch (typeof clientTransport) {
      case 'string':
        // could be 'sockjs', 'ws', or a path that should be required
        if (clientTransport === 'sockjs') {
          ClientImplementation = require.resolve(
            '../../client/clients/SockJSClient'
          );
        } else if (clientTransport === 'ws') {
          ClientImplementation = require.resolve(
            '../../client/clients/WebsocketClient'
          );
        } else {
          try {
            // eslint-disable-next-line import/no-dynamic-require
            ClientImplementation = require.resolve(clientTransport);
          } catch (e) {
            clientImplementationFound = false;
          }
        }
        break;
      default:
        clientImplementationFound = false;
    }

    if (!clientImplementationFound) {
      throw new Error(
        `${
          !isKnownWebSocketServerImplementation
            ? 'When you use custom web socket implementation you must explicitly specify client.transport. '
            : ''
        }client.transport must be a string denoting a default implementation (e.g. 'sockjs', 'ws') or a full path to a JS file via require.resolve(...) which exports a class `
      );
    }

    return ClientImplementation;
  }

  /**
   * @returns {string}
   */
  getWebSocketURL() {
    const { options } = this;
    const searchParams = new URLSearchParams();

    /** @type {"ws:" | "wss:" | "http:" | "https:" | "auto:"} */
    let protocol;

    // We are proxying dev server and need to specify custom `hostname`
    if (typeof options.client.webSocketURL.protocol !== 'undefined') {
      protocol = options.client.webSocketURL.protocol;
    } else {
      protocol = options.https ? 'wss:' : 'ws:';
    }

    searchParams.set('protocol', protocol);

    if (typeof options.client.webSocketURL.username !== 'undefined') {
      searchParams.set('username', options.client.webSocketURL.username);
    }

    if (typeof options.client.webSocketURL.password !== 'undefined') {
      searchParams.set('password', options.client.webSocketURL.password);
    }

    /** @type {string} */
    let hostname;

    // SockJS is not supported server mode, so `hostname` and `port` can't specified, let's ignore them
    // TODO show warning about this
    const isSockJSType = options.webSocketServer.type === 'sockjs';

    // We are proxying dev server and need to specify custom `hostname`
    if (typeof options.client.webSocketURL.hostname !== 'undefined') {
      hostname = options.client.webSocketURL.hostname;
    }
    // Web socket server works on custom `hostname`, only for `ws` because `sock-js` is not support custom `hostname`
    else if (
      typeof options.webSocketServer.options.host !== 'undefined' &&
      !isSockJSType
    ) {
      hostname = options.webSocketServer.options.host;
    }
    // The `host` option is specified
    else if (typeof this.options.host !== 'undefined') {
      hostname = this.options.host;
    }
    // The `port` option is not specified
    else {
      hostname = '0.0.0.0';
    }

    searchParams.set('hostname', hostname);

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
      port = '0';
    }

    searchParams.set('port', String(port));

    /** @type {string} */
    let pathname = '';

    // We are proxying dev server and need to specify custom `pathname`
    if (typeof options.client.webSocketURL.pathname !== 'undefined') {
      pathname = options.client.webSocketURL.pathname;
    }
    // Web socket server works on custom `path`
    else if (
      typeof options.webSocketServer.options.prefix !== 'undefined' ||
      typeof options.webSocketServer.options.path !== 'undefined'
    ) {
      pathname =
        options.webSocketServer.options.prefix ||
        options.webSocketServer.options.path;
    }

    searchParams.set('pathname', pathname);

    if (typeof options.client.logging !== 'undefined') {
      searchParams.set('logging', options.client.logging);
    }

    return searchParams.toString();
  }

  /**
   * @returns {string}
   */
  getClientEntry() {
    const webSocketURL = this.getWebSocketURL();
    /** @type {string} */

    return `${require.resolve('../../client/index.js')}?${webSocketURL}`;
  }

  getHotEntry() {
    const { options } = this;

    /** @type {(string[] | string)} */
    let hotEntry;

    if (options.hot === 'only') {
      hotEntry = require.resolve('webpack/hot/only-dev-server');
    } else if (options.hot) {
      hotEntry = require.resolve('webpack/hot/dev-server');
    }

    return hotEntry;
  }

  /**
   * @param {Object} compilerOptions
   * @returns {boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  isWebTarget(compilerOptions) {
    return compilerOptions.externalsPresets
      ? compilerOptions.externalsPresets.web
      : [
          'web',
          'webworker',
          'electron-preload',
          'electron-renderer',
          'node-webkit',
          // eslint-disable-next-line no-undefined
          undefined,
          null,
        ].includes(compilerOptions.target);
  }

  /**
   * Apply the plugin
   * @param {Object} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
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

    const additionalEntries = [];

    const clientEntry = this.getClientEntry();

    if (
      checkInject(
        this.options.client ? this.options.client.needClientEntry : null,
        compiler.options,
        this.isWebTarget(compiler.options) &&
          (Boolean(this.options.hot) || this.options.liveReload)
      )
    ) {
      additionalEntries.push(clientEntry);
    }

    const hotEntry = this.getHotEntry();

    if (
      hotEntry &&
      checkInject(
        this.options.client ? this.options.client.hotEntry : null,
        compiler.options,
        Boolean(this.options.hot)
      )
    ) {
      additionalEntries.push(hotEntry);
    }

    const webpack = compiler.webpack || require('webpack');

    // use a hook to add entries if available
    if (typeof webpack.EntryPlugin !== 'undefined') {
      for (const additionalEntry of additionalEntries) {
        new webpack.EntryPlugin(compiler.context, additionalEntry, {
          // eslint-disable-next-line no-undefined
          name: undefined,
        }).apply(compiler);
      }
    } else {
      /**
       * prependEntry Method for webpack 4
       * @param {Entry} originalEntry
       * @param {Entry} newAdditionalEntries
       * @returns {Entry}
       */
      const prependEntry = (originalEntry, newAdditionalEntries) => {
        if (typeof originalEntry === 'function') {
          return () =>
            Promise.resolve(originalEntry()).then((entry) =>
              prependEntry(entry, newAdditionalEntries)
            );
        }

        if (
          typeof originalEntry === 'object' &&
          !Array.isArray(originalEntry)
        ) {
          /** @type {Object<string,string>} */
          const clone = {};

          Object.keys(originalEntry).forEach((key) => {
            // entry[key] should be a string here
            const entryDescription = originalEntry[key];

            clone[key] = prependEntry(entryDescription, newAdditionalEntries);
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

      compiler.options.entry = prependEntry(
        compiler.options.entry || './src',
        additionalEntries
      );
      compiler.hooks.entryOption.call(
        compiler.options.context,
        compiler.options.entry
      );
    }

    const providePlugin = new webpack.ProvidePlugin({
      __webpack_dev_server_client__: this.getWebsocketTransport(),
    });

    providePlugin.apply(compiler);

    compiler.options.plugins = compiler.options.plugins || [];

    if (
      hotEntry &&
      !compiler.options.plugins.find(
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
