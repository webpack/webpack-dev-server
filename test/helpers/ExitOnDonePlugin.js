"use strict";

module.exports = class ExitOnDonePlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.afterDone.tap("webpack-dev-server", (stats) => {
      let exitCode = 0;

      if (stats.hasErrors()) {
        exitCode = 1;
      }

      process.stdout._handle.setBlocking(true);
      process.stderr._handle.setBlocking(true);

      const streams = [process.stdout, process.stderr];

      let drainCount = 0;

      // Actually exit if all streams are drained.
      function tryToExit() {
        if (drainCount === streams.length) {
          process.exit(exitCode);
        }
      }

      streams.forEach((stream) => {
        // Count drained streams now, but monitor non-drained streams.
        if (stream.bufferSize === 0) {
          drainCount += 1;
        } else {
          stream.write("", "utf-8", () => {
            drainCount += 1;

            tryToExit();
          });
        }

        // Prevent further writing.
        stream.write = () => {};
      });

      // If all streams were already drained, exit now.
      tryToExit();

      // In Windows, when run as a Node.js child process, a script utilizing
      // this library might just exit with a 0 exit code, regardless. This code,
      // despite the fact that it looks a bit crazy, appears to fix that.
      process.on("exit", () => {
        process.exit(exitCode);
      });
    });
  }
};
