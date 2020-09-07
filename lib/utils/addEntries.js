'use strict';

const webpack = require('webpack');
const createDomain = require('./createDomain');

/**
 * A Entry, it can be of type string or string[] or Object<string | string[],string>
 * @typedef {(string[] | string | Object<string | string[],string>)} Entry
 */

/**
 * Add entries Method
 * @param {?Object} originalCompiler - Webpack compiler
 * @param {?Object} options - Dev-Server options
 * @param {?Object} server
 * @returns {Function}
 */
function addEntries(originalCompiler, options, server) {
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
   * prependEntries Method
   * @param {Entry} originalEntry
   * @param {Entry} additionalEntries
   * @returns {Entry}
   */
  const prependEntries = (originalEntry, additionalEntries) => {
    if (typeof originalEntry === 'function') {
      return () =>
        Promise.resolve(originalEntry()).then((entry) =>
          prependEntries(entry, additionalEntries)
        );
    }

    if (typeof originalEntry === 'object' && !Array.isArray(originalEntry)) {
      const entryObj = {};

      Object.keys(originalEntry).forEach((key) => {
        const entryDescription = originalEntry[key];
        entryObj[key] = prependEntries(entryDescription, additionalEntries);
      });

      return entryObj;
    }

    // in this case, originalEntry is a string or an array.
    // make sure that we do not add duplicates.
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

  let handleTap = true;
  const closeCallback = () => {
    handleTap = false;
  };

  const compilers = originalCompiler.compilers || [originalCompiler];

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

    // add the HMR plugin to each compiler config if hot is enabled
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

    // if there are no additional entries to be added, nothing
    // below is needed
    if (!additionalEntries.length) {
      return;
    }

    if (webpack.version[0] === '5') {
      // EntryPlugin is only available for webpack@5
      // @ts-ignore
      const EntryPlugin = require('webpack/lib/EntryPlugin'); // eslint-disable-line import/no-unresolved
      // for webpack@5, we use a plugin to add global entries
      compiler.hooks.make.tapAsync(
        {
          name: 'webpack-dev-server',
          stage: -100,
        },
        (compilation, callback) => {
          if (!handleTap) {
            return callback();
          }
          const promises = additionalEntries.map((additionalEntry) => {
            return new Promise((fulfill, reject) => {
              const depOptions = {
                // eslint-disable-next-line no-undefined
                name: undefined, // global entry, added before all entries
              };
              const dep = EntryPlugin.createDependency(
                additionalEntry,
                depOptions
              );
              compilation.addEntry(compiler.context, dep, options, (err) => {
                if (err) {
                  return reject(err);
                }
                return fulfill();
              });
            });
          });

          Promise.all(promises)
            .then(() => {
              callback();
            })
            .catch(callback);
        }
      );
    } else {
      // this is a hacky method of injecting entries after compiler creation
      // that should only be used for webpack@4
      const originalEntry = config.entry || './src';
      config.entry = prependEntries(originalEntry, additionalEntries);
      compiler.hooks.entryOption.call(config.context, config.entry);
    }
  });

  return closeCallback;
}

module.exports = addEntries;
