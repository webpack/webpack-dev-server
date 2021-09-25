/* global __webpack_dev_server_client__ */

import WebSocketClient from "./clients/WebSocketClient.js";

// this WebsocketClient is here as a default fallback, in case the client is not injected
/* eslint-disable camelcase */
const Client =
  // eslint-disable-next-line camelcase, no-nested-ternary
  typeof __webpack_dev_server_client__ !== "undefined"
    ? // eslint-disable-next-line camelcase
      typeof __webpack_dev_server_client__.default !== "undefined"
      ? __webpack_dev_server_client__.default
      : __webpack_dev_server_client__
    : WebSocketClient;
/* eslint-enable camelcase */

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
    const message = JSON.parse(data);

    if (handlers[message.type]) {
      handlers[message.type](message.data);
    }
  });
};

export default socket;
