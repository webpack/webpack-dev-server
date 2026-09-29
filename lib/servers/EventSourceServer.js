import { EventEmitter } from "node:events";
import BaseServer from "./BaseServer.js";

/** @typedef {import("node:http").IncomingMessage} IncomingMessage */
/** @typedef {import("node:http").ServerResponse} ServerResponse */
/** @typedef {import("../Server.js").ClientConnection} ClientConnection */

// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

// `WebSocket.OPEN`. What this package's `sendMessage` checks before writing,
// so a stream that is still open has to report the same thing a socket does.
const OPEN = 1;

/**
 * Server-Sent Events, served by webpack-dev-middleware's `hot` endpoint.
 *
 * There is no second server here on purpose: a WebSocket needs the HTTP server
 * so it can answer an upgrade, but a stream is an ordinary response, so the
 * middleware already in the chain serves it — at the right position, behind
 * everything this package puts in front of it.
 *
 * What this class is, then, is the adapter between that endpoint and the shape
 * the rest of this package expects of a transport: an `implementation` that
 * emits `connection` with the request, and a `clients` array whose entries
 * answer `readyState`, `send`, `close` and `terminate`. Nothing above it can
 * tell which transport it is talking to.
 */
export default class EventSourceServer extends BaseServer {
  /**
   * @param {import("../Server.js").default} server server
   */
  constructor(server) {
    super(server);

    const hot = server.middleware && server.middleware.context.hot;

    if (!hot) {
      throw new Error(
        "The 'sse' transport is served by webpack-dev-middleware's hot endpoint, which is not running. It is enabled for you when 'webSocketServer.type' is 'sse'; a 'devMiddleware.hot' of 'false' turns it back off.",
      );
    }

    // Loosely typed on purpose: naming webpack-dev-middleware's own type here
    // puts a path into this package's generated declarations that only
    // resolves from inside this checkout.
    /** @type {EXPECTED_ANY} */
    this.hot = hot;
    // Only `on("connection")` and `on("close")` are used, and a plain emitter
    // answers both — the WebSocket one carries an actual server because `ws`
    // is one. Node's emitter rather than `EventTarget`: `on`/`emit` is the
    // shape `Server.js` calls and the one `ws` hands it, and an `EventTarget`
    // has neither.
    // eslint-disable-next-line unicorn/prefer-event-target
    this.implementation = /** @type {EXPECTED_ANY} */ (new EventEmitter());

    // Closing is this package's to do (`stop()` closes the transport), and
    // the middleware's `close()` also ends every stream. Either order is safe:
    // a client already gone is left alone below.
    /**
     * @param {(() => void)=} callback called once every stream is closed
     */
    const close = (callback) => {
      for (const client of this.clients) {
        client.close();
      }

      this.implementation.emit("close");

      // Deferred, the way `ws` defers it. The caller reads `clients` in the
      // statement after this one and drops its reference to this server inside
      // the callback, so running it now would pull that reference out from
      // under it.
      if (typeof callback === "function") {
        setImmediate(callback);
      }
    };

    /** @type {EXPECTED_ANY} */
    (this.implementation).close = close;

    hot.onConnect(
      /**
       * @param {ServerResponse} raw the stream this client is reading
       * @param {IncomingMessage} req the request it connected with
       */
      (raw, req) => {
        const client = this.createClient(raw);

        this.clients.push(client);

        raw.on("close", () => {
          const index = this.clients.indexOf(client);

          if (index !== -1) {
            this.clients.splice(index, 1);
          }
        });

        // With the request, so whoever is listening can read its headers and
        // decide — which is what this package does with `allowedHosts` and the
        // origin check, exactly as it does for a WebSocket.
        this.implementation.emit("connection", client, req);
      },
    );
  }

  /**
   * One connected stream, as a client this package can write to.
   * @param {ServerResponse} raw the stream
   * @returns {ClientConnection} the client
   */
  createClient(raw) {
    const end = () => {
      if (!raw.writableEnded) {
        raw.end();
      }
    };

    return /** @type {EXPECTED_ANY} */ ({
      get readyState() {
        return raw.writableEnded ? 3 : OPEN;
      },
      /**
       * Written as the message it already is. `sendMessage` serializes before
       * it gets here, so passing it through the middleware's `publishTo` would
       * encode it a second time and the browser would parse a string.
       * @param {string} message a serialized message
       */
      send(message) {
        if (raw.writableEnded) {
          return;
        }

        raw.write(`data: ${message}\n\n`);
      },
      close: end,
      terminate: end,
      // A stream has nothing to ping: the endpoint sends its own keep-alive,
      // and a reader that stops reading ends the response. Declared because
      // the transport shape has it.
      ping() {},
    });
  }
}
