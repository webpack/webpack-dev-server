"use strict";

module.exports = class ExitOnDonePlugin {
  apply(compiler) {
    compiler.hooks.afterDone.tap("webpack-dev-server", (stats) => {
      let exitCode = 0;

      if (stats.hasErrors()) {
        exitCode = 1;
      }

      setImmediate(() => {
        // eslint-disable-next-line n/no-process-exit
        process.exit(exitCode);
      });
    });
  }
};
