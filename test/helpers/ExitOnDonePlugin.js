"use strict";

module.exports = class ExitOnDonePlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.afterDone.tap("webpack-dev-server", (stats) => {
      let exitCode = 0;

      if (stats.hasErrors()) {
        exitCode = 1;
      }

      compiler.options.infrastructureLogging.stream.cork();

      const isDone = compiler.options.infrastructureLogging.stream.write("");

      compiler.options.infrastructureLogging.stream.end("");

      setInterval(() => {
        process.nextTick(() => {
          compiler.options.infrastructureLogging.stream.uncork();

          if (isDone) {
            process.exit(exitCode);
          }
        });
      }, 100);
    });
  }
};
