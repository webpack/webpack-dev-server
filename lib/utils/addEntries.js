'use strict';

const webpack = require('webpack');
const createDomain = require('./createDomain');

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

    const domain = createDomain(options, app);
    const sockPath = options.sockPath ? `&sockPath=${options.sockPath}` : '';
    const entries = [
      `${require.resolve('../../client/')}?${domain}${sockPath}`,
    ];

    if (options.hotOnly) {
      entries.push(require.resolve('webpack/hot/only-dev-server'));
    } else if (options.hot) {
      entries.push(require.resolve('webpack/hot/dev-server'));
    }

    const prependEntry = (entry) => {
      if (typeof entry === 'function') {
        return () => Promise.resolve(entry()).then(prependEntry);
      }

      if (typeof entry === 'object' && !Array.isArray(entry)) {
        const clone = {};

        Object.keys(entry).forEach((key) => {
          // entry[key] should be a string here
          clone[key] = prependEntry(entry[key]);
        });

        return clone;
      }

      // in this case, entry is a string or an array.
      // make sure that we do not add duplicates.
      const entriesClone = entries.slice(0);
      [].concat(entry).forEach((newEntry) => {
        if (!entriesClone.includes(newEntry)) {
          entriesClone.push(newEntry);
        }
      });
      return entriesClone;
    };

    // eslint-disable-next-line no-shadow
    [].concat(config).forEach((config) => {
      config.entry = prependEntry(config.entry || './src');

      if (options.hot || options.hotOnly) {
        config.plugins = config.plugins || [];
        if (
          !config.plugins.find(
            (plugin) =>
              plugin.constructor === webpack.HotModuleReplacementPlugin
          )
        ) {
          config.plugins.push(new webpack.HotModuleReplacementPlugin());
        }
      }
    });
  }
}

module.exports = addEntries;
