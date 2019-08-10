'use strict';

function handleStdin(options) {
  if (options.stdin) {
    // listening for this event only once makes testing easier,
    // since it prevents event listeners from hanging open
    process.stdin.once('end', () => {
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    });

    process.stdin.resume();
  }
}

module.exports = handleStdin;
