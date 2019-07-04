'use strict';

const isAbsoluteUrl = require('is-absolute-url');

function setPublicPath(compiler, options) {
  const firstWpOpt = compiler.compilers
    ? compiler.compilers[0].options
    : compiler.options;

  if (!options.publicPath) {
    // eslint-disable-next-line
    options.publicPath =
      (firstWpOpt.output && firstWpOpt.output.publicPath) || '';

    if (
      !isAbsoluteUrl(String(options.publicPath)) &&
      options.publicPath[0] !== '/'
    ) {
      options.publicPath = `/${options.publicPath}`;
    }
  }
}

module.exports = setPublicPath;
