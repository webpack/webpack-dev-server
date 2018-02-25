'use strict';

/* eslint no-param-reassign: 'off' */

const createDomain = require('./createDomain');

module.exports = function addDevServerEntrypoints(webpackOptions, devServerOptions, listeningApp) {
  if (devServerOptions.inline !== false) {
    // we're stubbing the app in this method as it's static and doesn't require
    // a listeningApp to be supplied. createDomain requires an app with the
    // address() signature.
    const app = listeningApp || {
      address() {
        return { port: devServerOptions.port };
      }
    };
    const domain = createDomain(devServerOptions, app);
    const devClient = [`${require.resolve('../../client/')}?${domain}`];

    if (devServerOptions.hotOnly) { devClient.push('webpack/hot/only-dev-server'); } else if (devServerOptions.hot) { devClient.push('webpack/hot/dev-server'); }

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
};
