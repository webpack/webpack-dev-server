/**
 * A `BaseServer` implementation, as a webpack-dev-middleware transport.
 *
 * The default socket is the middleware's now. This is the escape hatch that
 * is not: `webSocketServer` set to a class, to a module that exports one, or
 * to options that give the socket a port or a server of its own — none of
 * which the middleware offers, and all of which this server has documented
 * and tested since v4.
 *
 * Rather than keeping a second way to publish alongside the middleware's, an
 * implementation is wrapped into the shape the middleware asks a custom
 * transport for, so there is one path from a build to a page either way.
 * `BaseServer` keeps its published export and its contract: an
 * `implementation` that emits `connection`, and a `clients` array.
 */

/** @typedef {import("../Server.js").ClientConnection} ClientConnection */

/**
 * Put a payload on some clients.
 *
 * The wire shape is the middleware's, because the runtime reading it is the
 * middleware's. An implementation that only ever forwarded what it was handed
 * does not notice; one that inspected the old `{ type, data }` does, which is
 * said in the changelog.
 * @param {ClientConnection[]} clients the clients to send to
 * @param {EXPECTED_ANY} payload the payload
 * @returns {void}
 */
function send(clients, payload) {
  /** @type {string | undefined} */
  let message;

  for (const client of clients) {
    // `ws` uses `WebSocket.OPEN`, which is `1`. Serialized once, and only if
    // there is someone to send it to.
    if (client.readyState === 1) {
      message ??= JSON.stringify(payload);
      client.send(message);
    }
  }
}

/**
 * Wrap a `BaseServer` implementation as a transport.
 * @param {EXPECTED_ANY} instance the implementation, already constructed
 * @returns {EXPECTED_ANY} the transport the middleware asked for
 */
export default function bridge(instance) {
  /** @type {((client: ClientConnection, req: EXPECTED_ANY) => void)[]} */
  const connected = [];

  instance.implementation.on(
    "connection",
    /**
     * @param {ClientConnection} client the client
     * @param {EXPECTED_ANY} req the request it joined with
     */
    (client, req) => {
      for (const fn of connected) {
        fn(client, req);
      }
    },
  );

  return {
    /**
     * @param {(client: ClientConnection, req: EXPECTED_ANY) => void} fn called with each client that joins
     * @returns {void}
     */
    onConnect(fn) {
      connected.push(fn);
    },
    /**
     * @param {EXPECTED_ANY} payload the payload
     * @returns {void}
     */
    publish(payload) {
      send(instance.clients, payload);
    },
    /**
     * @param {ClientConnection} client the client
     * @param {EXPECTED_ANY} payload the payload
     * @returns {void}
     */
    publishTo(client, payload) {
      send([client], payload);
    },
    /**
     * @returns {boolean} whether anyone is listening
     */
    hasClients() {
      return instance.clients.length > 0;
    },
    /**
     * @param {(() => void)=} callback called once it is closed
     * @returns {void}
     */
    close(callback) {
      instance.implementation.close(callback);
    },
  };
}

// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */
