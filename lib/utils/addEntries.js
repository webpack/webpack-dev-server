'use strict';

const webpack = require('webpack');
const createDomain = require('./createDomain');

/**
 * A Entry, it can be of type string or string[] or Object<string | string[],string>
 * @typedef {(string[] | string | Object<string | string[],string>)} Entry
 */

/**
 * Additional entry to add to specific chunk
 * @typedef {Object} AdditionalChunkEntry
 * @property {Entry} entry
 * @property {string[]} [chunks]
 */

/**
 * Add entries Method
 * @param {?Object} config - Webpack config
 * @param {?Object} options - Dev-Server options
 * @param {?Object} server
 * @returns {void}
 */
function addEntries(config, options, server) {
  if (options.inline !== false) {
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
    const sockHost = options.sockHost ? `&sockHost=${options.sockHost}` : '';
    /** @type {string} */
    const sockPath = options.sockPath ? `&sockPath=${options.sockPath}` : '';
    /** @type {string} */
    const sockPort = options.sockPort ? `&sockPort=${options.sockPort}` : '';
    /** @type {string} */
    const clientEntry = `${require.resolve(
      '../../client/'
    )}?${domain}${sockHost}${sockPath}${sockPort}`;

    /** @type {(string[] | string)} */
    let hotEntry;

    if (options.hotOnly) {
      hotEntry = require.resolve('webpack/hot/only-dev-server');
    } else if (options.hot) {
      hotEntry = require.resolve('webpack/hot/dev-server');
    }
    /**
     * prependEntry Method
     * @param {Entry} originalEntry
     * @param {AdditionalChunkEntry[]} additionalEntries
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
          const chunkAdditionalEntries = additionalEntries.filter((additionalEntry) => {
            return (!additionalEntry.chunks || additionalEntry.chunks.includes(key));
          })

          const entryDescription = originalEntry[key];
          if (typeof entryDescription === 'object' && entryDescription.import) {
            clone[key] = Object.assign({}, entryDescription, {
              import: prependEntry(entryDescription.import, chunkAdditionalEntries),
            });
          } else {
            clone[key] = prependEntry(entryDescription, chunkAdditionalEntries);
          }
        });

        return clone;
      }

      // in this case, entry is a string or an array.
      // make sure that we do not add duplicates.
      /** @type {Entry} */
      const newEntries = additionalEntries.map((additionalEntry) => {
        return additionalEntry.entry;
      });
      [].concat(originalEntry).forEach((newEntry) => {
        if (!newEntries.includes(newEntry)) {
          newEntries.push(newEntry);
        }
      });
      return newEntries;
    };

    /**
     *
     * Description of the option for checkInject method
     * @typedef {Function} checkInjectOptionsParam
     * @param {Object} _config - compilerConfig
     * @return {Boolean | string[]}
     */

    /**
     *
     * @param {Boolean | string[] | checkInjectOptionsParam} option - inject(Hot|Client) it is Boolean | fn => Boolean
     * @param {Object} _config
     * @param {Boolean} defaultValue
     * @return {Boolean | string[]}
     */
    // eslint-disable-next-line no-shadow
    const checkInject = (option, _config, defaultValue) => {
      if (typeof option === 'boolean') return option;
      if (Array.isArray(option)) return option;
      if (typeof option === 'function') return option(_config);
      return defaultValue;
    };

    // eslint-disable-next-line no-shadow
    [].concat(config).forEach((config) => {
      /** @type {Boolean} */
      const webTarget = [
        'web',
        'webworker',
        'electron-renderer',
        'node-webkit',
        undefined, // eslint-disable-line
        null,
      ].includes(config.target);
      /** @type {AdditionalChunkEntry[]} */
      const additionalEntries = []

      const checkInjectClientResult = checkInject(options.injectClient, config, webTarget);
      if (checkInjectClientResult) {
        additionalEntries.push({
          entry: clientEntry,
          chunks: Array.isArray(checkInjectClientResult) ? checkInjectClientResult : null
        });
      }

      if (hotEntry) {
        const checkInjectHotResult = checkInject(options.injectHot, config, true);
        if (checkInjectHotResult) {
          additionalEntries.push({
            entry: hotEntry,
            chunks: Array.isArray(checkInjectHotResult) ? checkInjectHotResult : null
          });
        }
      }

      config.entry = prependEntry(config.entry || './src', additionalEntries);

      if (options.hot || options.hotOnly) {
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
}

module.exports = addEntries;
