'use strict';

const createConfig = require('./createConfig');
const defaultPort = require('./defaultPort');

function processOptions(config, argv, callback) {
  // processOptions {Promise}
  if (typeof config.then === 'function') {
    config
      .then((conf) => processOptions(conf, argv, callback))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err.stack || err);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      });

    return;
  }

  // Taken out of yargs because we must know if
  // it wasn't given by the user, in which case
  // we should use portfinder.
  const options = createConfig(config, argv, { port: defaultPort });

  callback(config, options);
}

module.exports = processOptions;
