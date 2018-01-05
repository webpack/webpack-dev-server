'use strict';

module.exports = {
  context: __dirname,
  entry: './foo.js',
  output: {
    filename: 'bundle.js'
  },
  plugins: [{
    apply(compiler) {
      compiler.plugin('done', (stats) => {
        let exitCode = 0;
        if (stats.hasErrors()) {
          exitCode = 1;
        }
        setTimeout(() => process.exit(exitCode));
      });
    }
  }]
};
