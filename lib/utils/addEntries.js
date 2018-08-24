'use strict';

/* eslint-disable
  no-param-reassign,
  space-before-function-paren
*/
const createDomain = require('./createDomain');

function addEntries (webpackOptions, devServerOptions, server) {
  if (devServerOptions.inline !== false) {
    // we're stubbing the app in this method as it's static and doesn't require
    // a server to be supplied. createDomain requires an app with the
    // address() signature.
    const app = server || {
      address() {
        return { port: devServerOptions.port };
      }
    };

    const domain = createDomain(devServerOptions, app);
    const devClient = [`${require.resolve('../../client/')}?${domain}`];

    if (devServerOptions.hotOnly) {
      devClient.push(require.resolve('webpack/hot/only-dev-server'));
    } else if (devServerOptions.hot) {
      devClient.push(require.resolve('webpack/hot/dev-server'));
    }

    const prependDevClient = (entry) => {
      if (typeof entry === 'function') {
        return () => Promise.resolve(entry()).then(prependDevClient);
      }

      if (typeof entry === 'object' && !Array.isArray(entry)) {
        const entryClone = {};

        Object.keys(entry).forEach((key) => {
          entryClone[key] = devClient.concat(entry[key]);
        });

        return entryClone;
      }

      return devClient.concat(entry);
    };

    [].concat(webpackOptions).forEach((wpOpt) => {
      wpOpt.entry = prependDevClient(wpOpt.entry || './src');
    });
  }
}

module.exports = addEntries;
