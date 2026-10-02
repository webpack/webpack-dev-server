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
  /** @type {EXPECTED_ANY} */
  hot: EXPECTED_ANY;
  implementation: any;
  /**
   * One connected stream, as a client this package can write to.
   * @param {ServerResponse} raw the stream
   * @returns {ClientConnection} the client
   */
  createClient(raw: ServerResponse): ClientConnection;
}
export type IncomingMessage = import("node:http").IncomingMessage;
export type ServerResponse = import("node:http").ServerResponse;
export type ClientConnection = import("../Server.js").ClientConnection;
export type EXPECTED_ANY = any;
import BaseServer from "./BaseServer.js";
