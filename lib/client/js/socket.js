'use strict';

/* global WebSocket */

const url = require('url');
const log = require('./log');

const maxRetries = 10;
let retry = maxRetries;

module.exports = function connect(options, handler) {
  const socketUrl = url.format({
    protocol: options.https ? 'wss' : 'ws',
    hostname: options.host,
    port: options.port
  });

  let open = false;
  let socket = new WebSocket(socketUrl);

  socket.addEventListener('open', () => {
    open = true;
    retry = maxRetries;
    log.info('WebSocket connected');
  });

  socket.addEventListener('close', () => {
    log.warn('WebSocket closed');

    open = false;
    socket = null;

    // exponentation operator ** isn't supported by IE at all
    // eslint-disable-next-line no-restricted-properties
    const timeout = (1000 * Math.pow((maxRetries - retry), 2)) + (Math.random() * 100);

    if (open || retry <= 0) {
      log.warn('WebSocket: ending reconnect after ' + maxRetries + ' attempts');
      return;
    }

    log.info('WebSocket: attempting reconnect in ' + parseInt(timeout / 1000, 10) + 's');

    setTimeout(() => {
      retry -= 1;

      connect(options, handler);
    }, timeout);
  });

  socket.addEventListener('message', (event) => {
    log.debug('WebSocket: message:', event.data);

    const message = JSON.parse(event.data);

    if (handler[message.type]) {
      handler[message.type](message.data);
    }
  });
};
