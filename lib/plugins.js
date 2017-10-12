'use strict';

const webpack = require('webpack');
const { sendStats } = require('./util');

module.exports = function plugins(compiler, devServer) {
  const { options } = devServer;

  function invalid() {
    const { socket } = devServer;
    if (socket) {
      socket.send(socket.payload('invalid'));
    }
  }

  const definePlugin = new webpack.DefinePlugin({
    DEV_SERVER_OPTIONS: JSON.stringify(options)
  });

  compiler.apply(definePlugin);

  if (options.progress) {
    const progressPlugin = new webpack.ProgressPlugin((percent, message, info) => {
      const { socket } = devServer;
      percent = Math.floor(percent * 100);
      if (percent === 100) {
        message = 'Compilation completed';
      }
      if (info) {
        message = `${message} (${info})`;
      }
      socket.send(socket.payload('progress-update', { percent, message }));
    });
    compiler.apply(progressPlugin);
  }

  compiler.plugin('compile', invalid);
  compiler.plugin('invalid', invalid);
  compiler.plugin('done', (stats) => {
    sendStats(devServer.socket, {
      force: true,
      stats: stats.toJson(options.clientStats)
    });
    devServer.stats = stats;
  });
};
