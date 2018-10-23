'use strict';

/* eslint-disable
  space-before-function-paren
*/
const webpack = require('webpack');

function addProgressPlugin (compiler, server) {
  const progressPlugin = new webpack.ProgressPlugin(
    (percent, msg, addInfo) => {
      percent = Math.floor(percent * 100);

      if (percent === 100) {
        msg = 'Compilation completed';
      }

      if (addInfo) {
        msg = `${msg} (${addInfo})`;
      }

      server.sockWrite(server.sockets, 'progress-update', { percent, msg });
    }
  );

  progressPlugin.apply(compiler);
}

module.exports = addProgressPlugin;
