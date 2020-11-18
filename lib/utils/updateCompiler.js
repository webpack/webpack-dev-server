'use strict';

const DevServerPlugin = require('./addEntries');

function updateCompiler(compiler, options) {
  const compilers = compiler.compilers || [compiler];
  // eslint-disable-next-line no-shadow
  compilers.forEach((compiler) => {
    const config = compiler.options;
    config.plugins = config.plugins || [];

    let devServerPlugin = config.plugins.find(
      (p) => p.constructor === DevServerPlugin
    );
    if (devServerPlugin) {
      // use existing plugin
      devServerPlugin.options = options;
    } else {
      devServerPlugin = new DevServerPlugin(options);
      config.plugins.push(devServerPlugin);
    }
    devServerPlugin.apply(compiler);
  });
}

module.exports = updateCompiler;
