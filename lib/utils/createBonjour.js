'use strict';

/* eslint-disable
  global-require,
*/

function createBonjour(options) {
  const bonjour = require('bonjour')();

  bonjour.publish({
    name: 'Webpack Dev Server',
    port: options.port,
    type: 'http',
    subtypes: ['webpack']
  });

  process.on('exit', () => {
    bonjour.unpublishAll(() => {
      bonjour.destroy();
    });
  });
}

module.exports = createBonjour;
