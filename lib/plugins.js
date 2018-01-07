'use strict';

const webpack = require('webpack');
const { send, sendStats } = require('./util');

module.exports = function plugins(compiler, devServer) {
  const { log, options, wss } = devServer;

  function invalid() {
    devServer.emit('compiler-invalid', compiler);
    wss.clients.forEach(ws => send(ws, devServer, 'invalid'));
  }

  const definePlugin = new webpack.DefinePlugin({
    DEV_SERVER_OPTIONS: JSON.stringify(options)
  });

  for (const comp of [].concat(compiler.compilers || compiler)) {
    log.debug('Applying DefinePlugin:DEV_SERVER_OPTIONS');
    comp.apply(definePlugin);
  }

  if (options.progress) {
    const progressPlugin = new webpack.ProgressPlugin((percent, message, info) => {
      percent = Math.floor(percent * 100);
      devServer.emit('progress', percent);

      if (percent === 100) {
        message = 'Compilation completed';
        devServer.emit('progress-complete');
      }

      if (info) {
        message = `${message} (${info})`;
      }

      wss.clients.forEach((ws) => {
        send(ws, devServer, 'progress-update', { percent, message });
        if (percent === 100) {
          send(ws, devServer, 'progress-complete', {});
        }
      });
    });
    compiler.apply(progressPlugin);
  }

  compiler.plugin('compile', invalid);
  compiler.plugin('invalid', invalid);
  compiler.plugin('done', (stats) => {
    devServer.emit('compiler-done', compiler, stats);
    wss.clients.forEach((ws) => {
      sendStats(ws, devServer, {
        force: true,
        stats: stats.toJson(options.clientStats)
      });
    });
    devServer.stats = stats;
  });
};
