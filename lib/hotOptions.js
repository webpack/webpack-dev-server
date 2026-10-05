/**
 * This server's hot options, as webpack-dev-middleware's.
 *
 * The middleware owns the hot runtime now — the client, the overlay, the
 * progress indicator, the transports on both ends, and putting the entry and
 * `HotModuleReplacementPlugin` into the compilation. What is left here is
 * saying the same thing in its vocabulary, so every option this server
 * documents keeps meaning what it meant.
 *
 * Protection is not mapped, deliberately. `allowedHosts`, the `Origin` checks
 * and the same-origin rule stay this server's: the middleware is handed
 * `cors: true` and no token, which is it applying no policy of its own, and
 * every connection is still judged here before anything is published to it.
 * Two policies over one socket is one of them silently losing.
 */

// The overlay element's id. The middleware's own default is its own name;
// this is the id pages, extensions and tests have queried for years, so it is
// said explicitly rather than inherited.
const OVERLAY_ID = "webpack-dev-server-client-overlay";

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
export function applyMode(hot, liveReload) {
  if (hot === "only") {
    return "hmr-only";
  }

  if (hot) {
    return "hmr";
  }

  return liveReload ? "reload" : "nothing";
}

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
}) {
  const url = /** @type {EXPECTED_ANY} */ (client.webSocketURL) || {};
  /** @type {Record<string, string | number>} */
  const spec = {};

  // A `webSocketURL` given as a string is normalized by parsing it, which
  // fills every part in — as `""` for the ones the url did not carry. Empty
  // has always meant "not said", and is resolved in the page like an absent
  // one, so it is left out rather than sent as a value the endpoint would
  // refuse.
  /**
   * @param {string} name which part
   * @returns {boolean} whether the url actually carries it
   */
  const given = (name) => url[name] !== undefined && url[name] !== "";

  // A page served over TLS cannot reach a plaintext endpoint, which the
  // runtime also enforces for itself — but when this server speaks TLS it is
  // known here, so it is said here.
  spec.protocol = given("protocol")
    ? url.protocol
    : isTlsServer
      ? "wss:"
      : "ws:";

  if (given("username")) {
    spec.username = url.username;
  }

  if (given("password")) {
    spec.password = url.password;
  }

  // Proxied, so the page connects somewhere this server is not.
  if (given("hostname")) {
    spec.hostname = url.hostname;
  }
  // A socket of its own, on a host of its own.
  else if (webSocketServerOptions.host !== undefined) {
    spec.hostname = /** @type {string} */ (webSocketServerOptions.host);
  } else if (host !== undefined) {
    spec.hostname = host;
  }
  // Every interface, which the runtime resolves to the page's own host.
  else {
    spec.hostname = "0.0.0.0";
  }

  if (given("port")) {
    spec.port = url.port;
  } else if (webSocketServerOptions.port !== undefined) {
    spec.port = /** @type {number} */ (webSocketServerOptions.port);
  } else if (typeof port === "number") {
    spec.port = port;
  } else if (typeof port === "string" && port !== "auto") {
    spec.port = Number(port);
  }
  // `"auto"`, or nothing: a port this server has not picked yet. `0` is how
  // the runtime is told to use the page's own, which is the one it was served
  // from — this server's.
  else {
    spec.port = "0";
  }

  spec.pathname = given("pathname") ? url.pathname : path;

  return spec;
}

/**
 * The overlay, with the id this server's pages already query.
 * @param {ClientConfiguration["overlay"]} overlay the `client.overlay` option
 * @returns {EXPECTED_ANY} the middleware's `hot.client.overlay`
 */
export function clientOverlay(overlay) {
  if (typeof overlay === "boolean" || overlay === undefined) {
    // Off is off; on still has to name the id, since the element is this
    // server's as far as anything looking for it is concerned.
    return overlay === false ? false : { id: OVERLAY_ID };
  }

  return { ...overlay, id: OVERLAY_ID };
}

/**
 * This server's options, as webpack-dev-middleware's `hot` option.
 * @param {HotOptionsInput} options options
 * @returns {EXPECTED_ANY} the middleware's `hot` option
 */
export default function hotOptions({
  devServerOptions,
  isTlsServer,
  transport,
}) {
  const { client, hot, liveReload, webSocketServer, host, port } =
    devServerOptions;

  // No socket, no hot: there is nothing to carry an update to a page, which is
  // what this option has always meant here.
  if (!webSocketServer) {
    return false;
  }

  const webSocketServerOptions =
    /** @type {NonNullable<WebSocketServerConfiguration["options"]>} */
    (webSocketServer.options) || {};
  const path =
    /** @type {string} */
    (webSocketServerOptions.prefix || webSocketServerOptions.path) || "/ws";

  // `"sse"` and `"ws"` are both the middleware's, so naming either is just
  // choosing its transport. Anything else is an implementation of this
  // server's own, bridged in.
  const wire = webSocketServer.type === "sse" ? "sse" : "ws";

  /** @type {EXPECTED_ANY} */
  const result = {
    transport: transport || wire,
    path,
    // This server decides who may reach the endpoint, so the middleware is
    // told to allow everything and judge nothing. Its own default would be a
    // second policy over one socket, and the narrower of two policies wins
    // silently — including over `allowedHosts`, which is this server's answer
    // to the same question and the documented one.
    cors: true,
    // Likewise: a token is a policy, and the one here is `allowedHosts` plus
    // the `Origin` checks. A token would also have to reach a client this
    // server did not inject, which `client: false` is exactly about.
    token: false,
  };

  // `client: false` is "no runtime in the page", not "no hot": the endpoint
  // still runs, and a page that wires a client of its own still gets its
  // builds. The middleware's `inject` covers the plugin as well as the entry,
  // so the plugin is applied here when there is no entry to carry it.
  if (!client) {
    result.inject = false;

    return result;
  }

  result.client = {
    // A transport of someone else's reaches the runtime through
    // `__webpack_dev_server_client__`; what it speaks is whatever it was
    // written to speak, and the endpoint serving it is this one either way.
    transport: wire,
    path: clientPath({
      client,
      webSocketServerOptions,
      host,
      port,
      isTlsServer,
      path,
    }),
    apply: applyMode(hot, liveReload),
    overlay: clientOverlay(client.overlay),
  };

  // The level, plus the name every message is labelled with: this package is
  // the one a developer installed, so the console says so rather than naming
  // a dependency they would not think to report a problem to.
  result.client.logging = {
    name: "webpack-dev-server",
    ...(client.logging === undefined ? {} : { level: client.logging }),
  };

  if (client.progress !== undefined) {
    result.client.progress = client.progress;
  }

  // `reconnect` is normalized before this: `true` is `Infinity`, `false` is
  // `0`, and unset is `10`.
  if (client.reconnect !== undefined) {
    result.client.connect = { retries: client.reconnect };
  }

  return result;
}

// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */
