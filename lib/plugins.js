'use strict';

const webpack = require('webpack');
const { sendStats } = require('./util');

module.exports = function plugins(compiler, devServer) {
  const { options, socket } = devServer;

  function invalid() {
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
      percent = Math.floor(percent * 100);
      if (percent === 100) {
        message = 'Compilation completed';
      }
      if (info) {
        message = `${message} (${info})`;
      }
      this.sockWrite(this.sockets, 'progress-update', { percent, message });
    });
    compiler.apply(progressPlugin);
  }

  compiler.plugin('compile', invalid);
  compiler.plugin('invalid', invalid);
  compiler.plugin('done', (stats) => {
    sendStats(socket, {
      force: true,
      stats: stats.toJson(options.clientStats)
    });
    devServer.stats = stats;
  });
};
