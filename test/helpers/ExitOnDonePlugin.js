"use strict";

module.exports = class ExitOnDonePlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.afterDone.tap("webpack-dev-server", (stats) => {
      let exitCode = 0;

      if (stats.hasErrors()) {
        exitCode = 1;
      }

      const stderr = compiler.options.infrastructureLogging.stream;

      let waitingIO = false;

      stderr.on("drain", () => {
        if (waitingIO) {
          process.exit(exitCode);
        }
      });

      if (stderr.write("")) {
        // no buffer left, exit now:
        process.exit(exitCode);
      } else {
        // write() returned false, kernel buffer is not empty yet...
        waitingIO = true;
      }
    });
  }
};
