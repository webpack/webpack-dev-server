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
    const sockHost = options.sockHost ? `&sockHost=${options.sockHost}` : '';
    const sockPath = options.sockPath ? `&sockPath=${options.sockPath}` : '';
    const sockPort = options.sockPort ? `&sockPort=${options.sockPort}` : '';
    const clientEntry = `${require.resolve(
      '../../client/'
    )}?${domain}${sockHost}${sockPath}${sockPort}`;
    let hotEntry;

    if (options.hotOnly) {
      hotEntry = require.resolve('webpack/hot/only-dev-server');
    } else if (options.hot) {
      hotEntry = require.resolve('webpack/hot/dev-server');
    }

    const prependEntry = (originalEntry, additionalEntries) => {
      if (typeof originalEntry === 'function') {
        return () =>
          Promise.resolve(originalEntry()).then((entry) =>
            prependEntry(entry, additionalEntries)
          );
      }

      if (typeof originalEntry === 'object' && !Array.isArray(originalEntry)) {
        const clone = {};

        Object.keys(originalEntry).forEach((key) => {
          // entry[key] should be a string here
          clone[key] = prependEntry(originalEntry[key], additionalEntries);
        });

        return clone;
      }

      // in this case, entry is a string or an array.
      // make sure that we do not add duplicates.
      const entriesClone = additionalEntries.slice(0);
      [].concat(originalEntry).forEach((newEntry) => {
        if (!entriesClone.includes(newEntry)) {
          entriesClone.push(newEntry);
        }
      });
      return entriesClone;
    };

    // eslint-disable-next-line no-shadow
    const checkInject = (option, config, defaultValue) => {
      if (typeof option === 'boolean') return option;
      if (typeof option === 'function') return option(config);
      return defaultValue;
    };

    // eslint-disable-next-line no-shadow
    [].concat(config).forEach((config) => {
      const webTarget =
        config.target === 'web' ||
        config.target === 'webworker' ||
        config.target === 'electron-renderer' ||
        config.target === 'node-webkit' ||
        config.target == null;
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

      config.entry = prependEntry(config.entry || './src', additionalEntries);

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
