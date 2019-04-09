'use strict';

const portfinder = require('portfinder');

function runPortFinder(defaultPort, cb) {
  portfinder.basePort = defaultPort;
  portfinder.getPort((err, port) => {
    cb(err, port);
  });
}

function findPort(server, defaultPort, defaultPortRetry, fn) {
  let tryCount = 0;
  const portFinderRunCb = (err, port) => {
    tryCount += 1;
    fn(err, port);
  };

  server.listeningApp.on('error', (err) => {
    if (err && err.code !== 'EADDRINUSE') {
      throw err;
    }

    if (tryCount >= defaultPortRetry) {
      fn(err);
      return;
    }

    runPortFinder(defaultPort, portFinderRunCb);
  });

  runPortFinder(defaultPort, portFinderRunCb);
}

module.exports = findPort;
