'use strict';

const signals = ['SIGINT', 'SIGTERM'];

function setupExitSignals(server) {
  signals.forEach((signal) => {
    process.on(signal, () => {
      if (server) {
        server.close(() => {
          // eslint-disable-next-line no-process-exit
          process.exit();
        });
      } else {
        // eslint-disable-next-line no-process-exit
        process.exit();
      }
    });
  });
}

module.exports = setupExitSignals;
