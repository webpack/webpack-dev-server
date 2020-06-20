'use strict';

let retries = 0;
let client = null;

const socket = function initSocket(url, handlers, clientClass) {
  // this WebsocketClient is here as a default fallback,
  // in case the client is not injected
  const Client = clientClass || require('../clients/WebsocketClient');
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
        socket(url, handlers, clientClass);
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
