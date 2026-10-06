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

// Where a click on a file in the overlay asks for it to be opened: the route
// this server mounts for that, which the overlay did not need told before it
// was the middleware's.
const OPEN_EDITOR_ENDPOINT = "/webpack-dev-server/open-editor";

// The Trusted Types policy the overlay creates, as this server has always
// named it. A page enforcing `trusted-types` lists the names it allows, so a
// different default would make the overlay throw the first time it opens.
const TRUSTED_TYPES_POLICY_NAME = "webpack-dev-server#overlay";

// How often a WebSocket client is pinged, as this server's own socket did: a
// connection left half-open — a laptop that slept, a network that changed — is
// noticed within a couple of seconds rather than twenty.
const WS_HEARTBEAT = 1000;

// `webSocketServer.options` that say where the endpoint is, rather than how
// the `ws` server behind it behaves.
const ENDPOINT_OPTIONS = new Set(["path", "prefix"]);

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
 * Whether source can stand where the overlay's runtime puts it — after
 * `var callback =`. Compiled rather than run: nothing in it is executed.
 * @param {string} source a function's source
 * @returns {boolean} true when it is an expression
 */
function isExpression(source) {
  try {
    // eslint-disable-next-line no-new-func
    const compiled = new Function(`var callback = ${source}`);

    return typeof compiled === "function";
  } catch {
    return false;
  }
}

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
export function problemFilter(filter) {
  if (typeof filter !== "function") {
    return filter;
  }

  const source = filter.toString();
  const expression = isExpression(source)
    ? source
    : isExpression(`function ${source}`)
      ? `function ${source}`
      : undefined;

  // Not something this can wrap; the middleware says so in its own words.
  if (!expression) {
    return filter;
  }

  /**
   * @param {string} message the problem's text
   * @returns {boolean} whether to show it
   */
  const wrapped = (message) =>
    filter({
      message,
      toString: () => message,
    });

  wrapped.toString = () =>
    `function (message) { return (${expression})({ message: message, toString: function () { return message; } }); }`;

  return wrapped;
}

/**
 * The overlay, with the id this server's pages already query.
 * @param {ClientConfiguration["overlay"]} overlay the `client.overlay` option
 * @returns {EXPECTED_ANY} the middleware's `hot.client.overlay`
 */
export function clientOverlay(overlay) {
  // Off is off; on still has to name the id, since the element is this
  // server's as far as anything looking for it is concerned.
  if (overlay === false) {
    return false;
  }

  const options =
    typeof overlay === "object"
      ? /** @type {Record<string, EXPECTED_ANY>} */ (overlay)
      : {};
  /** @type {Record<string, EXPECTED_ANY>} */
  const result = {
    openEditorEndpoint: OPEN_EDITOR_ENDPOINT,
    trustedTypesPolicyName: TRUSTED_TYPES_POLICY_NAME,
    ...options,
    id: OVERLAY_ID,
  };

  for (const name of ["errors", "warnings"]) {
    if (name in result) {
      result[name] = problemFilter(result[name]);
    }
  }

  return result;
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
  clientTransport,
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

  // The middleware's own WebSocket transport, so everything else
  // `webSocketServer.options` says goes to the `ws` server behind it, as it
  // always did: compression, payload limits, `verifyClient`, or a `port` or a
  // `server` of its own to listen on.
  if (!transport && wire === "ws") {
    /** @type {Record<string, EXPECTED_ANY>} */
    const ws = {};

    for (const [name, value] of Object.entries(webSocketServerOptions)) {
      if (!ENDPOINT_OPTIONS.has(name)) {
        ws[name] = value;
      }
    }

    if (Object.keys(ws).length > 0) {
      result.ws = ws;
    }

    result.heartbeat = WS_HEARTBEAT;
  }

  // `client: false` is "no runtime in the page", not "no hot": the endpoint
  // still runs, and a page that wires a client of its own still gets its
  // builds — and the plugin to apply them with, when `hot` asks for it.
  // Without `hot` there is nothing for the plugin to do, so the middleware
  // adds nothing at all.
  if (!client) {
    if (hot) {
      result.client = false;
    } else {
      result.inject = false;
    }

    return result;
  }

  result.client = {
    // A transport of someone else's — `client.webSocketTransport` naming a
    // module — is handed to the runtime in place of the built-in one, which is
    // what that option has always done. Either way the endpoint serving it is
    // this one.
    transport: clientTransport || wire,
    path: clientPath({
      client,
      webSocketServerOptions,
      host,
      port,
      isTlsServer,
      path,
    }),
    apply: applyMode(hot, liveReload),
    // The page-url parameters a tab opts out through, named after this
    // package as they always were: `?webpack-dev-server-hot=false`.
    urlPrefix: "webpack-dev-server",
    overlay: clientOverlay(client.overlay),
  };

  // The level, plus the name every message is labelled with: this package is
  // the one a developer installed, so the console says so rather than naming
  // a dependency they would not think to report a problem to.
  result.client.logging = {
    name: "webpack-dev-server",
    ...(client.logging === undefined ? {} : { level: client.logging }),
  };

  // Off unless asked for, as it always was here: the middleware's own default
  // is on.
  result.client.progress = client.progress ?? false;

  // `reconnect` is normalized before this: `true` is `Infinity`, `false` is
  // `0`, and unset is `10`.
  if (client.reconnect !== undefined) {
    result.client.connect = { retries: client.reconnect };
  }

  return result;
}

/**
 * A `BaseServer` implementation, as a webpack-dev-middleware transport.
 *
 * `webSocketServer` set to a class, or to a module that exports one, is an
 * implementation of this server's own that the middleware does not offer. It
 * is wrapped into the shape the middleware asks a custom transport for, so
 * there is one path from a build to a page either way. `BaseServer` keeps its
 * contract: an `implementation` that emits `connection`, and a `clients`
 * array.
 */

/** @typedef {import("./Server.js").ClientConnection} ClientConnection */

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
export function bridge(instance) {
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
