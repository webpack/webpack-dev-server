'use strict';

const webpack = require('webpack');
const log = require('./log');
const { sendStats } = require('./util');

module.exports = function plugins(compiler, devServer) {
  const { options } = devServer;

  function invalid() {
    devServer.emit('compiler-invalid', compiler);
    const { socket } = devServer;
    if (socket) {
      socket.send(socket.payload('invalid'));
    }
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
      const { socket } = devServer;

      percent = Math.floor(percent * 100);
      devServer.emit('progress', percent);

      if (percent === 100) {
        message = 'Compilation completed';
        devServer.emit('progress-complete');
      }

      if (info) {
        message = `${message} (${info})`;
      }

      if (socket) {
        socket.send(socket.payload('progress-update', { percent, message }));

        if (percent === 100) {
          socket.send(socket.payload('progress-complete', {}));
        }
      }
    });
    compiler.apply(progressPlugin);
  }

  compiler.plugin('compile', invalid);
  compiler.plugin('invalid', invalid);
  compiler.plugin('done', (stats) => {
    devServer.emit('compiler-done', compiler, stats);
    sendStats(devServer.socket, {
      force: true,
      stats: stats.toJson(options.clientStats)
    });
    devServer.stats = stats;
  });
};
