'use strict';

/* eslint-disable
  no-shadow,
  no-param-reassign,
  array-bracket-spacing,
  space-before-function-paren
*/
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
          clone[key] = entries.concat(entry[key]);
        });

        return clone;
      }

      return entries.concat(entry);
    };

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
