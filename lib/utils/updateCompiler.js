'use strict';

const DevServerPlugin = require('./DevServerPlugin');

function updateCompiler(compiler, options) {
  const compilers = compiler.compilers || [compiler];
  // eslint-disable-next-line no-shadow
  compilers.forEach((compiler) => {
    new DevServerPlugin(options).apply(compiler);
  });
}

module.exports = updateCompiler;
