'use strict';

module.exports = {
  apply(compiler) {
    compiler.hooks.done.tap('webpack-dev-server', (stats) => {
      let exitCode = 0;
      if (stats.hasErrors()) {
        exitCode = 1;
      }
      setTimeout(() => process.exit(exitCode));
    });
  },
};
