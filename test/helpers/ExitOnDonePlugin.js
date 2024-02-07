"use strict";

module.exports = class ExitOnDonePlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    let done = false;

    compiler.options.infrastructureLogging.stream.on("error", () => {
      done = true;
    });

    compiler.hooks.afterDone.tap("webpack-dev-server", (stats) => {
      let exitCode = 0;

      if (stats.hasErrors()) {
        exitCode = 1;
      }

      process.nextTick(() => {
        compiler.options.infrastructureLogging.stream.destroy(
          new Error("done"),
        );

        const interval = setInterval(() => {
          if (done) {
            clearInterval(interval);
            process.exit(exitCode);
          }
        }, 100);
      });
    });
  }
};
