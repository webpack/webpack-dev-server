'use strict';

/* global __webpack_dev_server_client__ */
/* eslint-disable
  camelcase
*/

// this SockJSClient is here as a default fallback, in case inline mode
// is off or the client is not injected. This will be switched to
// WebsocketClient when it becomes the default

// important: the path to SockJSClient here is made to work in the 'client'
// directory, but is updated via the webpack compilation when compiled from
// the 'client-src' directory
const Client =
  typeof __webpack_dev_server_client__ !== 'undefined'
    ? __webpack_dev_server_client__
    : // eslint-disable-next-line import/no-unresolved
      require('./clients/SockJSClient');

let retries = 0;
let client = null;

const socket = function initSocket(url, handlers) {
  client = new Client(url);

  client.onOpen(() => {
    retries = 0;
  });

  client.onClose(() => {
    if (retries === 0) {
      handlers.close();
    }

    // Try to reconnect.
    client = null;

    // After 10 retries stop trying, to prevent logspam.
    if (retries <= 10) {
      // Exponentially increase timeout to reconnect.
      // Respectfully copied from the package `got`.
      // eslint-disable-next-line no-mixed-operators, no-restricted-properties
      const retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;
      retries += 1;

      setTimeout(() => {
        socket(url, handlers);
      }, retryInMs);
    }
  });

  client.onMessage((data) => {
    const msg = JSON.parse(data);
    if (handlers[msg.type]) {
      handlers[msg.type](msg.data);
    }
  });
};

module.exports = socket;
