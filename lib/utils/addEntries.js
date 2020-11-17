'use strict';

const webpack = require('webpack');
const createDomain = require('./createDomain');
const DevServerEntryPlugin = require('./DevServerEntryPlugin');

/**
 * A Entry, it can be of type string or string[] or Object<string | string[],string>
 * @typedef {(string[] | string | Object<string | string[],string>)} Entry
 */

/**
 * Add entries Method
 * @param {?Object} compiler - Webpack compiler
 * @param {?Object} options - Dev-Server options
 * @param {?Object} server
 * @returns {void}
 */
function addEntries(compiler, options, server) {
  // we're stubbing the app in this method as it's static and doesn't require
  // a server to be supplied. createDomain requires an app with the
  // address() signature.

  const app = server || {
    address() {
      return { port: options.port };
    },
  };

  /** @type {string} */
  const domain = createDomain(options, app);
  /** @type {string} */
  const host =
    options.client && options.client.host ? `&host=${options.client.host}` : '';
  /** @type {string} */
  let path = '';
  // only add the path if it is not default
  if (options.client && options.client.path && options.client.path !== '/ws') {
    path = `&path=${options.client.path}`;
  }
  /** @type {string} */
  const port =
    options.client && options.client.port ? `&port=${options.client.port}` : '';
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

  const compilers = compiler.compilers || [compiler];

  // eslint-disable-next-line no-shadow
  compilers.forEach((compiler) => {
    const config = compiler.options;
    /** @type {Boolean} */
    const webTarget = [
      'web',
      'webworker',
      'electron-renderer',
      'node-webkit',
      // eslint-disable-next-line no-undefined
      undefined,
      null,
    ].includes(config.target);
    /** @type {Entry} */
    const additionalEntries = checkInject(
      options.injectClient,
      config,
      webTarget
    )
      ? [clientEntry]
      : [];

    if (hotEntry && checkInject(options.injectHot, config, true)) {
      additionalEntries.push(hotEntry);
    }

    // use a plugin to add entries if available
    // @ts-ignore
    if (webpack.EntryPlugin) {
      // use existing plugin if possible
      let entryPlugin = config.plugins.find(
        (plugin) => plugin.constructor.name === 'DevServerEntryPlugin'
      );

      if (entryPlugin) {
        entryPlugin.entries = additionalEntries;
      } else {
        entryPlugin = new DevServerEntryPlugin(
          compiler.context,
          additionalEntries,
          {} // global entry
        );
        config.plugins.push(entryPlugin);
        entryPlugin.apply(compiler);
      }
    } else {
      config.entry = prependEntry(config.entry || './src', additionalEntries);
      compiler.hooks.entryOption.call(config.context, config.entry);
    }

    if (options.hot || options.hot === 'only') {
      config.plugins = config.plugins || [];
      if (
        !config.plugins.find(
          // Check for the name rather than the constructor reference in case
          // there are multiple copies of webpack installed
          (plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin'
        )
      ) {
        config.plugins.push(new webpack.HotModuleReplacementPlugin());
      }
    }
  });
}

module.exports = addEntries;
