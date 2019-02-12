'use strict';

/* global WorkerGlobalScope self */

function sendWebpackDevServer(data) {
  if (
    typeof self !== 'undefined' &&
    (typeof WorkerGlobalScope === 'undefined' ||
      !(self instanceof WorkerGlobalScope))
  ) {
    self.postMessage({
      type: 'sendWebpackDevServer',
      data,
    });
  }
}

module.exports = sendWebpackDevServer;
