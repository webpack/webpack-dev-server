'use strict';

const signals = ['SIGINT', 'SIGTERM'];

function setupExitSignals(server) {
  const closeAndExit = () => {
    if (server) {
      server.close(() => {
        // eslint-disable-next-line no-process-exit
        process.exit();
      });
    } else {
      // eslint-disable-next-line no-process-exit
      process.exit();
    }
  };

  if (server.options.setupExitSignals) {
    signals.forEach((signal) => {
      process.on(signal, closeAndExit);
    });
  }

  if (server.options.stdin) {
    process.stdin.on('end', closeAndExit);
    process.stdin.resume();
  }
}

module.exports = setupExitSignals;
