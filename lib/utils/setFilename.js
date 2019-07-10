'use strict';

function setFilename(compiler, options) {
  const firstWpOpt = compiler.compilers
    ? compiler.compilers[0].options
    : compiler.options;

  if (!options.filename && firstWpOpt.output && firstWpOpt.output.filename) {
    options.filename = firstWpOpt.output.filename;
  }
}

module.exports = setFilename;
