'use strict';

function runBonjour(options) {
  // eslint-disable-next-line global-require
  const bonjour = require('bonjour')();

  bonjour.publish({
    name: 'Webpack Dev Server',
    port: options.port,
    type: 'http',
    subtypes: ['webpack'],
  });

  process.on('exit', () => {
    bonjour.unpublishAll(() => {
      bonjour.destroy();
    });
  });
}

module.exports = runBonjour;
