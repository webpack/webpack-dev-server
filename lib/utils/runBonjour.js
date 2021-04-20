'use strict';

function runBonjour(options) {
  const bonjour = require('bonjour')();
  const os = require('os');
  const { https, port } = options;
  bonjour.publish({
    name: `Webpack Dev Server ${os.hostname()}:${port}`,
    port,
    type: https ? 'https' : 'http',
    subtypes: ['webpack'],
    ...options.bonjour,
  });

  process.on('exit', () => {
    bonjour.unpublishAll(() => {
      bonjour.destroy();
    });
  });
}

module.exports = runBonjour;
