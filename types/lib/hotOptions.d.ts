/** @typedef {import("./Server.js").ClientConfiguration} ClientConfiguration */
/** @typedef {import("./Server.js").WebSocketServerConfiguration} WebSocketServerConfiguration */
/** @typedef {NonNullable<WebSocketServerConfiguration["options"]>} WebSocketServerOptions */
/**
 * @typedef {object} ClientPathInput
 * @property {ClientConfiguration} client the `client` option
 * @property {WebSocketServerOptions} webSocketServerOptions the `webSocketServer.options` option
 * @property {string | undefined} host the `host` option
 * @property {number | string | undefined} port the `port` option
 * @property {boolean | undefined} isTlsServer whether this server speaks TLS
 * @property {string} path the path the endpoint is served at
 */
/**
 * @typedef {object} HotOptionsInput
 * @property {EXPECTED_ANY} devServerOptions this server's normalized options
 * @property {boolean | undefined} isTlsServer whether this server speaks TLS
 * @property {(() => EXPECTED_ANY)=} transport a transport of this server's own, when the `webSocketServer` option asks for one
 * @property {string=} clientTransport the module `client.webSocketTransport` names, resolved, when it names one rather than a built-in transport
 */
/**
 * What a build should do to the page, as one option rather than two.
 *
 * `hot` and `liveReload` were never independent: live reload is what happens
 * when hot module replacement is off, and `hot: "only"` is hot module
 * replacement that does not fall back to loading the page.
 * @param {boolean | "only" | undefined} hot the `hot` option
 * @param {boolean | undefined} liveReload the `liveReload` option
 * @returns {"hmr" | "hmr-only" | "reload" | "nothing"} the middleware's `apply` mode
 */
export function applyMode(
  hot: boolean | "only" | undefined,
  liveReload: boolean | undefined,
): "hmr" | "hmr-only" | "reload" | "nothing";
/**
 * Where the runtime connects, as the parts that differ.
 *
 * Every part is resolved in the page when it is not given, which is the only
 * place some of it is known — and the values only a server could have meant
 * resolve there too: `0.0.0.0` is not an address a page can connect to, and a
 * port of `0` is one the server picked. So they are passed through as they
 * are rather than guessed at here.
 * @param {ClientPathInput} options options
 * @returns {Record<string, string | number>} the middleware's `hot.client.path`
 */
export function clientPath({
  client,
  webSocketServerOptions,
  host,
  port,
  isTlsServer,
  path,
}: ClientPathInput): Record<string, string | number>;
/**
 * The query this server wrote after its client entry, for a subclass whose
 * `getClientEntry()` names a module of its own: that module is put in `entry`
 * with it, as it always was.
 * TODO in the next major release remove this, along with `getClientEntry()`
 * @param {{ devServerOptions: EXPECTED_ANY, isTlsServer: boolean }} options options
 * @returns {string} the query, without the `?`
 */
export function clientEntryQuery({
  devServerOptions,
  isTlsServer,
}: {
  devServerOptions: EXPECTED_ANY;
  isTlsServer: boolean;
}): string;
/**
 * A `client.overlay.errors` or `client.overlay.warnings` filter, as this
 * server documents it: called with a problem object and reading its
 * `message`. The middleware's overlay calls a filter with the problem's text,
 * so the filter is wrapped to be handed `{ message }` again — and it still
 * reads as that text wherever it is used as a string.
 *
 * The function travels to the browser as its source, so the wrapper is
 * written as source too: what the middleware serializes is `toString()`.
 * @param {EXPECTED_ANY} filter the filter, or the boolean in its place
 * @returns {EXPECTED_ANY} the filter the middleware is given
 */
export function problemFilter(filter: EXPECTED_ANY): EXPECTED_ANY;
/**
 * The overlay, with the id this server's pages already query.
 * @param {ClientConfiguration["overlay"]} overlay the `client.overlay` option
 * @returns {EXPECTED_ANY} the middleware's `hot.client.overlay`
 */
export function clientOverlay(
  overlay: ClientConfiguration["overlay"],
): EXPECTED_ANY;
/**
 * This server's options, as webpack-dev-middleware's `hot` option.
 * @param {HotOptionsInput} options options
 * @returns {EXPECTED_ANY} the middleware's `hot` option
 */
export default function hotOptions({
  devServerOptions,
  isTlsServer,
  transport,
  clientTransport,
}: HotOptionsInput): EXPECTED_ANY;
/**
 * Wrap a `BaseServer` implementation as a transport.
 * @param {EXPECTED_ANY} instance the implementation, already constructed
 * @returns {EXPECTED_ANY} the transport the middleware asked for
 */
export function bridge(instance: EXPECTED_ANY): EXPECTED_ANY;
export type ClientConfiguration = import("./Server.js").ClientConfiguration;
export type WebSocketServerConfiguration =
  import("./Server.js").WebSocketServerConfiguration;
export type WebSocketServerOptions = NonNullable<
  WebSocketServerConfiguration["options"]
>;
export type ClientPathInput = {
  /**
   * the `client` option
   */
  client: ClientConfiguration;
  /**
   * the `webSocketServer.options` option
   */
  webSocketServerOptions: WebSocketServerOptions;
  /**
   * the `host` option
   */
  host: string | undefined;
  /**
   * the `port` option
   */
  port: number | string | undefined;
  /**
   * whether this server speaks TLS
   */
  isTlsServer: boolean | undefined;
  /**
   * the path the endpoint is served at
   */
  path: string;
};
export type HotOptionsInput = {
  /**
   * this server's normalized options
   */
  devServerOptions: EXPECTED_ANY;
  /**
   * whether this server speaks TLS
   */
  isTlsServer: boolean | undefined;
  /**
   * a transport of this server's own, when the `webSocketServer` option asks for one
   */
  transport?: (() => EXPECTED_ANY) | undefined;
  /**
   * the module `client.webSocketTransport` names, resolved, when it names one rather than a built-in transport
   */
  clientTransport?: string | undefined;
};
export type ClientConnection = import("./Server.js").ClientConnection;
export type EXPECTED_ANY = any;
