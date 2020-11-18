'use strict';

const DevServerPlugin = require('./DevServerPlugin');

function updateCompiler(compiler, options) {
  const compilers = compiler.compilers || [compiler];
  // eslint-disable-next-line no-shadow
  compilers.forEach((compiler) => {
    const compilerOptions = compiler.options;
    compilerOptions.plugins = compilerOptions.plugins || [];

    let devServerPlugin = compilerOptions.plugins.find(
      (p) => p.constructor === DevServerPlugin
    );
    if (devServerPlugin) {
      // use existing plugin
      devServerPlugin.options = options;
    } else {
      devServerPlugin = new DevServerPlugin(options);
      compilerOptions.plugins.push(devServerPlugin);
    }
    devServerPlugin.apply(compiler);
  });
}

module.exports = updateCompiler;
