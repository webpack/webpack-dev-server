import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import url from "node:url";
import fs from "graceful-fs";
import ipaddr from "ipaddr.js";
import { validate } from "schema-utils";
import schema from "./options.json" with { type: "json" };

// Named `cjsRequire` (not `require`) so it doesn't shadow the implicit CommonJS
// `require` in the transpiled `dist/cjs` build, which would collide with the
// `require("url")` that `babel-plugin-transform-import-meta` injects here.
const cjsRequire = createRequire(import.meta.url);

/** @type {Promise<typeof import("webpack") | undefined> | undefined} */
let webpackPeer;

/**
 * Lazily load the optional `webpack` peer dependency.
 * @returns {Promise<typeof import("webpack") | undefined>} resolved webpack module, or undefined when not installed
 */
function loadWebpackPeer() {
  webpackPeer ??= import("webpack")
    .then((m) => m.default)
    .catch(() => undefined);
  return webpackPeer;
}

/** @typedef {import("schema-utils").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").MultiCompiler} MultiCompiler */
/** @typedef {import("webpack").Configuration} WebpackConfiguration */
/** @typedef {import("webpack").StatsOptions} StatsOptions */
/** @typedef {import("webpack").StatsCompilation} StatsCompilation */
/** @typedef {import("webpack").Stats} Stats */
/** @typedef {import("webpack").MultiStats} MultiStats */
/** @typedef {import("os").NetworkInterfaceInfo} NetworkInterfaceInfo */
/** @typedef {import("chokidar").ChokidarOptions} WatchOptions */
/** @typedef {import("chokidar").FSWatcher} FSWatcher */
/** @typedef {import("connect-history-api-fallback").Options} ConnectHistoryApiFallbackOptions */
/** @typedef {import("bonjour-service").Bonjour} Bonjour */
/** @typedef {import("bonjour-service").Service} BonjourOptions */
/** @typedef {import("http-proxy-middleware").RequestHandler} RequestHandler */
/** @typedef {import("http-proxy-middleware").Options} HttpProxyMiddlewareOptions */
/** @typedef {import("http-proxy-middleware").Filter} HttpProxyMiddlewareOptionsFilter */
/** @typedef {import("serve-index").Options} ServeIndexOptions */
/** @typedef {import("serve-static").ServeStaticOptions} ServeStaticOptions */
/** @typedef {import("ipaddr.js").IPv4} IPv4 */
/** @typedef {import("ipaddr.js").IPv6} IPv6 */
/** @typedef {import("net").Socket} Socket */
/** @typedef {import("http").Server} HTTPServer */
/** @typedef {import("http").IncomingMessage} IncomingMessage */
/** @typedef {import("http").ServerResponse} ServerResponse */
/** @typedef {import("open").Options} OpenOptions */
/** @typedef {import("express").Application} ExpressApplication */
/** @typedef {import("express").RequestHandler} ExpressRequestHandler */
/** @typedef {import("express").ErrorRequestHandler} ExpressErrorRequestHandler */
/** @typedef {import("express").Request} ExpressRequest */
/** @typedef {import("express").Response} ExpressResponse */

// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

/** @typedef {(err?: EXPECTED_ANY) => void} NextFunction */
/** @typedef {(req: IncomingMessage, res: ServerResponse) => void} SimpleHandleFunction */
/** @typedef {(req: IncomingMessage, res: ServerResponse, next: NextFunction) => void} NextHandleFunction */
/** @typedef {(err: EXPECTED_ANY, req: IncomingMessage, res: ServerResponse, next: NextFunction) => void} ErrorHandleFunction */
/** @typedef {SimpleHandleFunction | NextHandleFunction | ErrorHandleFunction} HandleFunction */

/** @typedef {import("https").ServerOptions} ServerOptions */

/**
 * @template {BasicApplication} [T=ExpressApplication]
 * @typedef {T extends ExpressApplication ? ExpressRequest : IncomingMessage} Request
 */
/**
 * @template {BasicApplication} [T=ExpressApplication]
 * @typedef {T extends ExpressApplication ? ExpressResponse : ServerResponse} Response
 */

/**
 * @template {Request} T
 * @template {Response} U
 * @typedef {import("webpack-dev-middleware").Options<T, U>} DevMiddlewareOptions
 */

/**
 * @template {Request} T
 * @template {Response} U
 * @typedef {import("webpack-dev-middleware").Context<T, U>} DevMiddlewareContext
 */

/**
 * @typedef {"local-ip" | "local-ipv4" | "local-ipv6" | string} Host
 */

/**
 * @typedef {number | string | "auto"} Port
 */

/**
 * @typedef {object} WatchFiles
 * @property {string | string[]} paths paths
 * @property {(WatchOptions & { aggregateTimeout?: number, ignored?: WatchOptions["ignored"], poll?: number | boolean })=} options options
 */

/**
 * @typedef {object} Static
 * @property {string=} directory directory
 * @property {(string | string[])=} publicPath public path
 * @property {(boolean | ServeIndexOptions)=} serveIndex serve index
 * @property {ServeStaticOptions=} staticOptions static options
 * @property {(boolean | WatchOptions & { aggregateTimeout?: number, ignored?: WatchOptions["ignored"], poll?: number | boolean })=} watch watch and watch options
 */

/**
 * @typedef {object} NormalizedStatic
 * @property {string} directory
 * @property {string[]} publicPath
 * @property {false | ServeIndexOptions} serveIndex
 * @property {ServeStaticOptions} staticOptions
 * @property {false | WatchOptions} watch
 */

/**
 * @template {BasicApplication} [A=ExpressApplication]
 * @template {BasicServer} [S=import("http").Server]
 * @typedef {"http" | "https" | "http2" | string | ((serverOptions: ServerOptions, application: A) => S)} ServerType
 */

/**
 * @template {BasicApplication} [A=ExpressApplication]
 * @template {BasicServer} [S=import("http").Server]
 * @typedef {object} ServerConfiguration
 * @property {ServerType<A, S>=} type type
 * @property {ServerOptions=} options options
 */

/**
 * @typedef {object} WebSocketServerConfiguration
 * @property {("ws" | string | (() => WebSocketServerConfiguration))=} type type
 * @property {Record<string, EXPECTED_ANY>=} options options
 */

/**
 * @typedef {(import("ws").WebSocket & { send: import("ws").WebSocket["send"], terminate: import("ws").WebSocket["terminate"], ping: import("ws").WebSocket["ping"] }) & { isAlive?: boolean }} ClientConnection
 */

/**
 * @typedef {import("ws").WebSocketServer & { close: import("ws").WebSocketServer["close"] }} WebSocketServer
 */

/**
 * @typedef {{ implementation: WebSocketServer, clients: ClientConnection[] }} WebSocketServerImplementation
 */

/**
 * @typedef {{ path?: HttpProxyMiddlewareOptionsFilter | undefined, context?: HttpProxyMiddlewareOptionsFilter | undefined } & HttpProxyMiddlewareOptions} ProxyConfigArrayItem
 */

/**
 * @typedef {(ProxyConfigArrayItem | ((req?: Request | undefined, res?: Response | undefined, next?: NextFunction | undefined) => ProxyConfigArrayItem))[]} ProxyConfigArray
 */

/**
 * @typedef {object} OpenApp
 * @property {string=} name
 * @property {string[]=} arguments
 */

/**
 * @typedef {object} Open
 * @property {(string | string[] | OpenApp)=} app
 * @property {(string | string[])=} target target
 */

/**
 * @typedef {object} NormalizedOpen
 * @property {string} target
 * @property {import("open").Options} options
 */

/**
 * @typedef {object} WebSocketURL
 * @property {string=} hostname hostname
 * @property {string=} password password
 * @property {string=} pathname pathname
 * @property {(number | string)=} port port
 * @property {string=} protocol protocol
 * @property {string=} username username
 */

/**
 * @typedef {boolean | ((error: Error) => void)} OverlayMessageOptions
 */

/**
 * @typedef {object} ClientConfiguration
 * @property {"log" | "info" | "warn" | "error" | "none" | "verbose"=} logging logging
 * @property {(boolean | { warnings?: OverlayMessageOptions, errors?: OverlayMessageOptions, runtimeErrors?: OverlayMessageOptions })=} overlay overlay
 * @property {boolean=} progress progress
 * @property {(boolean | number)=} reconnect reconnect
 * @property {("ws" | string)=} webSocketTransport web socket transport
 * @property {(string | WebSocketURL)=} webSocketURL web socket URL
 */

/**
 * @typedef {{ key: string, value: string }[] | Record<string, string | string[]>} Headers
 */

/**
 * @template {BasicApplication} [T=ExpressApplication]
 * @typedef {T extends ExpressApplication ? ExpressRequestHandler | ExpressErrorRequestHandler : HandleFunction} MiddlewareHandler
 */

/**
 * @typedef {{ name?: string, path?: string, middleware: MiddlewareHandler }} MiddlewareObject
 */

/**
 * @typedef {MiddlewareObject | MiddlewareHandler} Middleware
 */

/** @typedef {import("net").Server | import("tls").Server} BasicServer */

/**
 * @template {BasicApplication} [A=ExpressApplication]
 * @template {BasicServer} [S=import("http").Server]
 * @typedef {object} Configuration
 * @property {(boolean | string)=} ipc
 * @property {Host=} host
 * @property {Port=} port
 * @property {(boolean | "only")=} hot
 * @property {boolean=} liveReload
 * @property {DevMiddlewareOptions<Request, Response>=} devMiddleware
 * @property {boolean=} compress
 * @property {("auto" | "all" | string | string[])=} allowedHosts
 * @property {(boolean | ConnectHistoryApiFallbackOptions)=} historyApiFallback
 * @property {(boolean | Record<string, never> | BonjourOptions)=} bonjour
 * @property {(string | string[] | WatchFiles | (string | WatchFiles)[])=} watchFiles
 * @property {(boolean | string | Static | (string | Static)[])=} static
 * @property {(ServerType<A, S> | ServerConfiguration<A, S>)=} server
 * @property {(() => Promise<A>)=} app
 * @property {(boolean | "ws" | string | WebSocketServerConfiguration)=} webSocketServer
 * @property {ProxyConfigArray=} proxy
 * @property {(boolean | string | Open | (string | Open)[])=} open
 * @property {boolean=} setupExitSignals
 * @property {(boolean | ClientConfiguration)=} client
 * @property {(Headers | ((req: Request, res: Response, context: DevMiddlewareContext<Request, Response> | undefined) => Headers))=} headers
 * @property {((devServer: Server<A, S>) => void)=} onListening
 * @property {((middlewares: Middleware[], devServer: Server<A, S>) => Middleware[])=} setupMiddlewares
 */

if (!process.env.WEBPACK_SERVE) {
  process.env.WEBPACK_SERVE = "true";
}

/**
 * @template T
 * @typedef {() => T} FunctionReturning
 */

/**
 * @template T
 * @param {FunctionReturning<T>} fn memorized function
 * @returns {FunctionReturning<T>} new function
 */
const memoize = (fn) => {
  let cache = false;
  /** @type {T | undefined} */
  let result;
  return () => {
    if (cache) {
      return /** @type {T} */ (result);
    }

    result = fn();
    cache = true;
    // Allow to clean up memory for fn
    // and all dependent resources
    /** @type {FunctionReturning<T> | undefined} */
    (fn) = undefined;
    return /** @type {T} */ (result);
  };
};

const getExpress = memoize(async () => (await import("express")).default);

/**
 * @param {OverlayMessageOptions=} setting overlay settings
 * @returns {undefined | string | boolean} encoded overlay settings
 */
const encodeOverlaySettings = (setting) =>
  typeof setting === "function"
    ? encodeURIComponent(setting.toString())
    : setting;

// Working for overload, because typescript doesn't support this yes
/**
 * @overload
 * @param {NextHandleFunction} fn function
 * @returns {BasicApplication} application
 */
/**
 * @overload
 * @param {HandleFunction} fn function
 * @returns {BasicApplication} application
 */
/**
 * @overload
 * @param {string} route route
 * @param {NextHandleFunction} fn function
 * @returns {BasicApplication} application
 */
/**
 * @param {string} route route
 * @param {HandleFunction} fn function
 * @returns {BasicApplication} application
 */
// eslint-disable-next-line no-unused-vars
function useFn(route, fn) {
  return /** @type {BasicApplication} */ ({});
}

const DEFAULT_ALLOWED_PROTOCOLS = /^(file|.+-extension):/i;

/**
 * @typedef {object} BasicApplication
 * @property {typeof useFn} use
 */

const pluginName = "webpack-dev-server";

/**
 * @template {BasicApplication} [A=ExpressApplication]
 * @template {BasicServer} [S=HTTPServer]
 */
class Server {
  /**
   * @param {Configuration<A, S> | undefined} options options
   * @param {(Compiler | MultiCompiler)=} compiler compiler, omitted when the server is used as a plugin via `apply()`
   */
  constructor(options, compiler) {
    options = options === undefined ? {} : options;

    validate(/** @type {Schema} */ (schema), options, {
      name: "Dev Server",
      baseDataPath: "options",
    });

    if (compiler) {
      this.compiler = compiler;

      /**
       * @type {ReturnType<Compiler["getInfrastructureLogger"]>}
       */
      this.logger = this.compiler.getInfrastructureLogger(pluginName);
    }
    this.options = options;
    /**
     * @type {FSWatcher[]}
     */
    this.staticWatchers = [];
    /**
     * @private
     * @type {{ name: string | symbol, listener: (...args: EXPECTED_ANY[]) => void }[]} }
     */
    this.listeners = [];
    // Keep track of websocket proxies for external websocket upgrade.
    /**
     * @private
     * @type {RequestHandler[]}
     */
    this.webSocketProxies = [];
    /**
     * @type {Socket[]}
     */
    this.sockets = [];
    /**
     * @private
     * @type {string | undefined}
     */

    this.currentHash = undefined;
    /**
     * @private
     * @type {boolean}
     */
    this.isPlugin = false;
  }

  static get schema() {
    return schema;
  }

  /**
   * @private
   * @returns {StatsOptions} default stats options
   */
  static get DEFAULT_STATS() {
    return {
      all: false,
      hash: true,
      warnings: true,
      errors: true,
      errorDetails: false,
    };
  }

  /**
   * @param {string} URL url
   * @returns {boolean} true when URL is absolute, otherwise false
   */
  static isAbsoluteURL(URL) {
    // Don't match Windows paths `c:\`
    if (/^[a-zA-Z]:\\/.test(URL)) {
      return false;
    }

    // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
    // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(URL);
  }

  /**
   * @param {string} gatewayOrFamily gateway or family
   * @param {boolean=} isInternal ip should be internal
   * @returns {string | undefined} resolved IP
   */
  static findIp(gatewayOrFamily, isInternal) {
    if (gatewayOrFamily === "v4" || gatewayOrFamily === "v6") {
      let host;

      const networks = Object.values(os.networkInterfaces())
        .flatMap((networks) => networks ?? [])
        .filter((network) => {
          if (!network || !network.address) {
            return false;
          }

          if (network.family !== `IP${gatewayOrFamily}`) {
            return false;
          }

          if (
            typeof isInternal !== "undefined" &&
            network.internal !== isInternal
          ) {
            return false;
          }

          if (gatewayOrFamily === "v6") {
            const range = ipaddr.parse(network.address).range();

            if (
              range !== "ipv4Mapped" &&
              range !== "uniqueLocal" &&
              range !== "loopback"
            ) {
              return false;
            }
          }

          return network.address;
        });

      if (networks.length > 0) {
        // Take the first network found
        host = networks[0].address;

        if (host.includes(":")) {
          host = `[${host}]`;
        }
      }

      return host;
    }

    const gatewayIp = ipaddr.parse(gatewayOrFamily);

    // Look for the matching interface in all local interfaces.
    for (const addresses of Object.values(os.networkInterfaces())) {
      for (const { cidr } of /** @type {NetworkInterfaceInfo[]} */ (
        addresses
      )) {
        const net = ipaddr.parseCIDR(/** @type {string} */ (cidr));

        if (
          net[0] &&
          net[0].kind() === gatewayIp.kind() &&
          // eslint-disable-next-line unicorn/prefer-regexp-test
          gatewayIp.match(net)
        ) {
          return net[0].toString();
        }
      }
    }
  }

  /**
   * @param {Host} hostname hostname
   * @returns {Promise<string>} resolved hostname
   */
  static async getHostname(hostname) {
    if (hostname === "local-ip") {
      return (
        Server.findIp("v4", false) || Server.findIp("v6", false) || "0.0.0.0"
      );
    } else if (hostname === "local-ipv4") {
      return Server.findIp("v4", false) || "0.0.0.0";
    } else if (hostname === "local-ipv6") {
      return Server.findIp("v6", false) || "::";
    }

    return hostname;
  }

  /**
   * @param {Port} port port
   * @param {string} host host
   * @returns {Promise<number | string>} free port
   */
  static async getFreePort(port, host) {
    if (typeof port !== "undefined" && port !== null && port !== "auto") {
      return port;
    }

    const { default: pRetry } = await import("p-retry");
    const { default: getPort } = await import("./getPort.js");

    const basePort =
      typeof process.env.WEBPACK_DEV_SERVER_BASE_PORT !== "undefined"
        ? Number.parseInt(process.env.WEBPACK_DEV_SERVER_BASE_PORT, 10)
        : 8080;

    // Try to find unused port and listen on it for 3 times,
    // if port is not specified in options.
    const defaultPortRetry =
      typeof process.env.WEBPACK_DEV_SERVER_PORT_RETRY !== "undefined"
        ? Number.parseInt(process.env.WEBPACK_DEV_SERVER_PORT_RETRY, 10)
        : 3;

    return pRetry(() => getPort(basePort, host), {
      retries: defaultPortRetry,
    });
  }

  /**
   * @returns {string} path to cache dir
   */
  static findCacheDir() {
    const cwd = process.cwd();

    /**
     * @type {string | undefined}
     */
    let dir = cwd;

    for (;;) {
      try {
        if (fs.statSync(path.join(dir, "package.json")).isFile()) break;
        // eslint-disable-next-line no-empty
      } catch {}

      const parent = path.dirname(dir);

      if (dir === parent) {
        dir = undefined;
        break;
      }

      dir = parent;
    }

    if (!dir) {
      return path.resolve(cwd, `.cache/${pluginName}`);
    } else if (process.versions.pnp === "1") {
      return path.resolve(dir, `.pnp/.cache/${pluginName}`);
    } else if (process.versions.pnp === "3") {
      return path.resolve(dir, `.yarn/.cache/${pluginName}`);
    }

    return path.resolve(dir, `node_modules/.cache/${pluginName}`);
  }

  /**
   * @private
   * @param {Compiler} compiler compiler
   * @returns {boolean} true when target is `web` or `universal`, otherwise false
   */
  static isWebTarget(compiler) {
    const { platform } = compiler;

    // A `web` or universal target (`web` and `node` both `null`) injects the
    // client. `target: false` is `null` everywhere, so it is excluded.
    return Boolean(
      platform.web ||
        /** @type {{ universal?: boolean | null }} */ (platform)?.universal ||
        (compiler.options.target !== false &&
          platform.web === null &&
          platform.node === null),
    );
  }

  /**
   * @private
   * @param {Compiler} compiler compiler
   * @returns {Promise<void>}
   */
  async addAdditionalEntries(compiler) {
    /**
     * @type {string[]}
     */
    const additionalEntries = [];
    const isWebTarget = Server.isWebTarget(compiler);

    // TODO maybe empty client
    if (this.options.client && isWebTarget) {
      let webSocketURLStr = "";

      if (this.options.webSocketServer) {
        const webSocketURL =
          /** @type {WebSocketURL} */
          (
            /** @type {ClientConfiguration} */
            (this.options.client).webSocketURL
          );
        const webSocketServer =
          /** @type {{ type: WebSocketServerConfiguration["type"], options: NonNullable<WebSocketServerConfiguration["options"]> }} */
          (this.options.webSocketServer);
        const searchParams = new URLSearchParams();

        /** @type {string} */
        let protocol;

        // We are proxying dev server and need to specify custom `hostname`
        if (typeof webSocketURL.protocol !== "undefined") {
          protocol = webSocketURL.protocol;
        } else {
          protocol = this.isTlsServer ? "wss:" : "ws:";
        }

        searchParams.set("protocol", protocol);

        if (typeof webSocketURL.username !== "undefined") {
          searchParams.set("username", webSocketURL.username);
        }

        if (typeof webSocketURL.password !== "undefined") {
          searchParams.set("password", webSocketURL.password);
        }

        /** @type {string} */
        let hostname;

        const isWebSocketServerHostDefined =
          typeof webSocketServer.options.host !== "undefined";
        const isWebSocketServerPortDefined =
          typeof webSocketServer.options.port !== "undefined";

        // We are proxying dev server and need to specify custom `hostname`
        if (typeof webSocketURL.hostname !== "undefined") {
          hostname = webSocketURL.hostname;
        }
        // Web socket server works on custom `hostname`, only for `ws` because `sock-js` is not support custom `hostname`
        else if (isWebSocketServerHostDefined) {
          hostname = webSocketServer.options.host;
        }
        // The `host` option is specified
        else if (typeof this.options.host !== "undefined") {
          hostname = this.options.host;
        }
        // The `port` option is not specified
        else {
          hostname = "0.0.0.0";
        }

        searchParams.set("hostname", hostname);

        /** @type {number | string} */
        let port;

        // We are proxying dev server and need to specify custom `port`
        if (typeof webSocketURL.port !== "undefined") {
          port = webSocketURL.port;
        }
        // Web socket server works on custom `port`, only for `ws` because `sock-js` is not support custom `port`
        else if (isWebSocketServerPortDefined) {
          port = webSocketServer.options.port;
        }
        // The `port` option is specified
        else if (typeof this.options.port === "number") {
          port = this.options.port;
        }
        // The `port` option is specified using `string`
        else if (
          typeof this.options.port === "string" &&
          this.options.port !== "auto"
        ) {
          port = Number(this.options.port);
        }
        // The `port` option is not specified or set to `auto`
        else {
          port = "0";
        }

        searchParams.set("port", String(port));

        /** @type {string} */
        let pathname = "";

        // We are proxying dev server and need to specify custom `pathname`
        if (typeof webSocketURL.pathname !== "undefined") {
          pathname = webSocketURL.pathname;
        }
        // Web socket server works on custom `path`
        else if (
          typeof webSocketServer.options.prefix !== "undefined" ||
          typeof webSocketServer.options.path !== "undefined"
        ) {
          pathname =
            webSocketServer.options.prefix || webSocketServer.options.path;
        }

        searchParams.set("pathname", pathname);

        const client = /** @type {ClientConfiguration} */ (this.options.client);

        if (typeof client.logging !== "undefined") {
          searchParams.set("logging", client.logging);
        }

        if (typeof client.progress !== "undefined") {
          searchParams.set("progress", String(client.progress));
        }

        if (typeof client.overlay !== "undefined") {
          const overlayString =
            typeof client.overlay === "boolean"
              ? String(client.overlay)
              : JSON.stringify({
                  ...client.overlay,
                  errors: encodeOverlaySettings(client.overlay.errors),
                  warnings: encodeOverlaySettings(client.overlay.warnings),
                  runtimeErrors: encodeOverlaySettings(
                    client.overlay.runtimeErrors,
                  ),
                });

          searchParams.set("overlay", overlayString);
        }

        if (typeof client.reconnect !== "undefined") {
          searchParams.set(
            "reconnect",
            typeof client.reconnect === "number"
              ? String(client.reconnect)
              : "10",
          );
        }

        if (typeof this.options.hot !== "undefined") {
          searchParams.set("hot", String(this.options.hot));
        }

        if (typeof this.options.liveReload !== "undefined") {
          searchParams.set("live-reload", String(this.options.liveReload));
        }

        webSocketURLStr = searchParams.toString();
      }

      additionalEntries.push(`${this.getClientEntry()}?${webSocketURLStr}`);
    }

    const clientHotEntry = this.getClientHotEntry();
    if (clientHotEntry) {
      additionalEntries.push(clientHotEntry);
    }

    const webpack =
      compiler.webpack ||
      /** @type {NonNullable<Awaited<ReturnType<typeof loadWebpackPeer>>>} */ (
        await loadWebpackPeer()
      );

    // use a hook to add entries if available
    for (const additionalEntry of additionalEntries) {
      new webpack.EntryPlugin(compiler.context, additionalEntry, {
        name: undefined,
      }).apply(compiler);
    }
  }

  /**
   * @private
   * @returns {Compiler["options"]} compiler options
   */
  getCompilerOptions() {
    if (
      typeof (/** @type {MultiCompiler} */ (this.compiler).compilers) !==
      "undefined"
    ) {
      if (/** @type {MultiCompiler} */ (this.compiler).compilers.length === 1) {
        return (
          /** @type {MultiCompiler} */
          (this.compiler).compilers[0].options
        );
      }

      // Configuration with the `devServer` options
      const compilerWithDevServer =
        /** @type {MultiCompiler} */
        (this.compiler).compilers.find((config) => config.options.devServer);

      if (compilerWithDevServer) {
        return compilerWithDevServer.options;
      }

      // Configuration with `web` preset
      const compilerWithWebPreset =
        /** @type {MultiCompiler} */
        (this.compiler).compilers.find((config) => Server.isWebTarget(config));

      if (compilerWithWebPreset) {
        return compilerWithWebPreset.options;
      }

      // Fallback
      return /** @type {MultiCompiler} */ (this.compiler).compilers[0].options;
    }

    return /** @type {Compiler} */ (this.compiler).options;
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async normalizeOptions() {
    const { options } = this;
    const compilerOptions = this.getCompilerOptions();
    const compilerWatchOptions = compilerOptions.watchOptions;
    /**
     * @param {WatchOptions & { aggregateTimeout?: number, ignored?: WatchOptions["ignored"], poll?: number | boolean }} watchOptions watch options
     * @returns {WatchOptions} normalized watch options
     */
    const getWatchOptions = (watchOptions = {}) => {
      const getPolling = () => {
        if (typeof watchOptions.usePolling !== "undefined") {
          return watchOptions.usePolling;
        }

        if (typeof watchOptions.poll !== "undefined") {
          return Boolean(watchOptions.poll);
        }

        if (typeof compilerWatchOptions.poll !== "undefined") {
          return Boolean(compilerWatchOptions.poll);
        }

        return false;
      };
      const getInterval = () => {
        if (typeof watchOptions.interval !== "undefined") {
          return watchOptions.interval;
        }

        if (typeof watchOptions.poll === "number") {
          return watchOptions.poll;
        }

        if (typeof compilerWatchOptions.poll === "number") {
          return compilerWatchOptions.poll;
        }
      };

      const usePolling = getPolling();
      const interval = getInterval();
      const { poll: _poll, interval: _interval, ...rest } = watchOptions;

      return {
        ignoreInitial: true,
        persistent: true,
        followSymlinks: false,
        atomic: false,
        alwaysStat: true,
        ignorePermissionErrors: true,
        // Respect options from compiler watchOptions
        usePolling,
        ...(interval !== undefined ? { interval } : {}),
        ...rest,
      };
    };
    /**
     * @param {(string | Static | undefined)=} optionsForStatic for static
     * @returns {NormalizedStatic} normalized options for static
     */
    const getStaticItem = (optionsForStatic) => {
      const getDefaultStaticOptions = () => ({
        directory: path.join(process.cwd(), "public"),
        staticOptions: {},
        publicPath: ["/"],
        serveIndex: { icons: true },
        watch: getWatchOptions(),
      });

      /** @type {NormalizedStatic} */
      let item;

      if (typeof optionsForStatic === "undefined") {
        item = getDefaultStaticOptions();
      } else if (typeof optionsForStatic === "string") {
        item = {
          ...getDefaultStaticOptions(),
          directory: optionsForStatic,
        };
      } else {
        const def = getDefaultStaticOptions();

        item = {
          directory:
            typeof optionsForStatic.directory !== "undefined"
              ? optionsForStatic.directory
              : def.directory,
          staticOptions:
            typeof optionsForStatic.staticOptions !== "undefined"
              ? { ...def.staticOptions, ...optionsForStatic.staticOptions }
              : def.staticOptions,
          publicPath:
            typeof optionsForStatic.publicPath !== "undefined"
              ? Array.isArray(optionsForStatic.publicPath)
                ? optionsForStatic.publicPath
                : [optionsForStatic.publicPath]
              : def.publicPath,
          serveIndex:
            // Check if 'serveIndex' property is defined in 'optionsForStatic'
            // If 'serveIndex' is a boolean and true, use default 'serveIndex'
            // If 'serveIndex' is an object, merge its properties with default 'serveIndex'
            // If 'serveIndex' is neither a boolean true nor an object, use it as-is
            // If 'serveIndex' is not defined in 'optionsForStatic', use default 'serveIndex'
            typeof optionsForStatic.serveIndex !== "undefined"
              ? typeof optionsForStatic.serveIndex === "boolean" &&
                optionsForStatic.serveIndex
                ? def.serveIndex
                : typeof optionsForStatic.serveIndex === "object"
                  ? { ...def.serveIndex, ...optionsForStatic.serveIndex }
                  : optionsForStatic.serveIndex
              : def.serveIndex,
          watch:
            typeof optionsForStatic.watch !== "undefined"
              ? typeof optionsForStatic.watch === "boolean"
                ? optionsForStatic.watch
                  ? def.watch
                  : false
                : getWatchOptions(optionsForStatic.watch)
              : def.watch,
        };
      }

      if (Server.isAbsoluteURL(item.directory)) {
        throw new Error("Using a URL as static.directory is not supported");
      }

      return item;
    };

    if (typeof options.allowedHosts === "undefined") {
      // AllowedHosts allows some default hosts picked from `options.host` or `webSocketURL.hostname` and `localhost`
      options.allowedHosts = "auto";
    }
    // We store allowedHosts as array when supplied as string
    else if (
      typeof options.allowedHosts === "string" &&
      options.allowedHosts !== "auto" &&
      options.allowedHosts !== "all"
    ) {
      options.allowedHosts = [options.allowedHosts];
    }
    // CLI pass options as array, we should normalize them
    else if (
      Array.isArray(options.allowedHosts) &&
      options.allowedHosts.includes("all")
    ) {
      options.allowedHosts = "all";
    }

    if (typeof options.bonjour === "undefined") {
      options.bonjour = false;
    } else if (typeof options.bonjour === "boolean") {
      options.bonjour = options.bonjour ? {} : false;
    }

    if (
      typeof options.client === "undefined" ||
      (typeof options.client === "object" && options.client !== null)
    ) {
      if (!options.client) {
        options.client = {};
      }

      if (typeof options.client.webSocketURL === "undefined") {
        options.client.webSocketURL = {};
      } else if (typeof options.client.webSocketURL === "string") {
        const parsedURL = new URL(options.client.webSocketURL);

        options.client.webSocketURL = {
          protocol: parsedURL.protocol,
          hostname: parsedURL.hostname,
          port: parsedURL.port.length > 0 ? Number(parsedURL.port) : "",
          pathname: parsedURL.pathname,
          username: parsedURL.username,
          password: parsedURL.password,
        };
      } else if (typeof options.client.webSocketURL.port === "string") {
        options.client.webSocketURL.port = Number(
          options.client.webSocketURL.port,
        );
      }

      // Enable client overlay by default
      if (typeof options.client.overlay === "undefined") {
        options.client.overlay = true;
      } else if (typeof options.client.overlay !== "boolean") {
        options.client.overlay = {
          errors: true,
          warnings: true,
          ...options.client.overlay,
        };
      }

      if (typeof options.client.reconnect === "undefined") {
        options.client.reconnect = 10;
      } else if (options.client.reconnect === true) {
        options.client.reconnect = Infinity;
      } else if (options.client.reconnect === false) {
        options.client.reconnect = 0;
      }

      // Respect infrastructureLogging.level
      if (typeof options.client.logging === "undefined") {
        options.client.logging = compilerOptions.infrastructureLogging
          ? compilerOptions.infrastructureLogging.level
          : "info";
      }
    }

    if (typeof options.compress === "undefined") {
      options.compress = true;
    }

    if (typeof options.devMiddleware === "undefined") {
      options.devMiddleware = {};
    }

    // No need to normalize `headers`

    if (typeof options.historyApiFallback === "undefined") {
      options.historyApiFallback = false;
    } else if (
      typeof options.historyApiFallback === "boolean" &&
      options.historyApiFallback
    ) {
      options.historyApiFallback = {};
    }

    // No need to normalize `host`

    options.hot =
      typeof options.hot === "boolean" || options.hot === "only"
        ? options.hot
        : true;

    if (
      typeof options.server === "function" ||
      typeof options.server === "string"
    ) {
      options.server = {
        type: options.server,
        options: {},
      };
    } else {
      const serverOptions =
        /** @type {ServerConfiguration<A, S>} */
        (options.server || {});

      options.server = {
        type: serverOptions.type || "http",
        options: { ...serverOptions.options },
      };
    }

    const serverOptions = /** @type {ServerOptions} */ (options.server.options);

    if (options.server.type === "https" || options.server.type === "http2") {
      if (typeof serverOptions.requestCert === "undefined") {
        serverOptions.requestCert = false;
      }

      const httpsProperties =
        /** @type {(keyof ServerOptions)[]} */
        (["ca", "cert", "crl", "key", "pfx"]);

      for (const property_ of httpsProperties) {
        const property = /** @type {keyof ServerOptions} */ (property_);

        if (typeof serverOptions[property] === "undefined") {
          continue;
        }

        const value = serverOptions[property];
        /**
         * @param {string | Buffer | undefined} item file to read
         * @returns {string | Buffer | undefined} content of file
         */
        const readFile = (item) => {
          if (
            Buffer.isBuffer(item) ||
            (typeof item === "object" && item !== null && !Array.isArray(item))
          ) {
            return item;
          }

          if (item) {
            let stats = null;

            try {
              stats = fs.lstatSync(fs.realpathSync(item)).isFile();
            } catch {
              // Ignore error
            }

            // It is a file
            return stats ? fs.readFileSync(item) : item;
          }
        };

        /** @type {EXPECTED_ANY} */
        (serverOptions)[property] = Array.isArray(value)
          ? value.map((item) =>
              readFile(
                /** @type {string | Buffer | undefined} */
                (item),
              ),
            )
          : readFile(
              /** @type {string | Buffer | undefined} */
              (value),
            );
      }

      let fakeCert;

      if (!serverOptions.key || !serverOptions.cert) {
        const certificateDir = Server.findCacheDir();
        const certificatePath = path.join(certificateDir, "server.pem");
        let certificateExists;

        try {
          const certificate = await fs.promises.stat(certificatePath);
          certificateExists = certificate.isFile();
        } catch {
          certificateExists = false;
        }

        if (certificateExists) {
          const certificateTtl = 1000 * 60 * 60 * 24;
          const certificateStat = await fs.promises.stat(certificatePath);
          const now = Date.now();

          // cert is more than 30 days old, kill it with fire
          if ((now - Number(certificateStat.ctime)) / certificateTtl > 30) {
            this.logger.info(
              "SSL certificate is more than 30 days old. Removing...",
            );

            await fs.promises.rm(certificatePath, { recursive: true });

            certificateExists = false;
          }
        }

        if (!certificateExists) {
          this.logger.info("Generating SSL certificate...");

          const { default: selfsigned } = await import("selfsigned");

          const attributes = [{ name: "commonName", value: "localhost" }];
          const notBeforeDate = new Date();
          const notAfterDate = new Date();
          notAfterDate.setDate(notAfterDate.getDate() + 30);
          const pems = await selfsigned.generate(attributes, {
            algorithm: "sha256",
            keySize: 2048,
            notBeforeDate,
            notAfterDate,
            extensions: [
              {
                name: "basicConstraints",
                cA: true,
              },
              {
                name: "keyUsage",
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true,
              },
              {
                name: "extKeyUsage",
                serverAuth: true,
                clientAuth: true,
                codeSigning: true,
                timeStamping: true,
              },
              {
                name: "subjectAltName",
                altNames: [
                  {
                    // type 2 is DNS
                    type: 2,
                    value: "localhost",
                  },
                  {
                    type: 2,
                    value: "localhost.localdomain",
                  },
                  {
                    type: 2,
                    value: "lvh.me",
                  },
                  {
                    type: 2,
                    value: "*.lvh.me",
                  },
                  {
                    type: 2,
                    value: "[::1]",
                  },
                  {
                    // type 7 is IP
                    type: 7,
                    ip: "127.0.0.1",
                  },
                  {
                    type: 7,
                    ip: "fe80::1",
                  },
                ],
              },
            ],
          });

          await fs.promises.mkdir(certificateDir, { recursive: true });

          await fs.promises.writeFile(
            certificatePath,
            pems.private + pems.cert,
            {
              encoding: "utf8",
            },
          );
        }

        fakeCert = await fs.promises.readFile(certificatePath);

        this.logger.info(`SSL certificate: ${certificatePath}`);
      }

      serverOptions.key ||= fakeCert;
      serverOptions.cert ||= fakeCert;
    }

    if (typeof options.ipc === "boolean") {
      const isWindows = process.platform === "win32";
      const pipePrefix = isWindows ? "\\\\.\\pipe\\" : os.tmpdir();
      const pipeName = `${pluginName}.sock`;

      options.ipc = path.join(pipePrefix, pipeName);
    }

    options.liveReload =
      typeof options.liveReload !== "undefined" ? options.liveReload : true;

    // https://github.com/webpack/webpack-dev-server/issues/1990
    const defaultOpenOptions = { wait: false };
    /**
     * @param {import("open").Options & { target?: string | string[] } & EXPECTED_ANY} target target
     * @returns {NormalizedOpen[]} normalized open options
     */
    const getOpenItemsFromObject = ({ target, ...rest }) => {
      const normalizedOptions = { ...defaultOpenOptions, ...rest };

      if (typeof normalizedOptions.app === "string") {
        normalizedOptions.app = {
          name: normalizedOptions.app,
        };
      }

      const normalizedTarget = typeof target === "undefined" ? "<url>" : target;

      if (Array.isArray(normalizedTarget)) {
        return normalizedTarget.map((singleTarget) => ({
          target: singleTarget,
          options: normalizedOptions,
        }));
      }

      return [{ target: normalizedTarget, options: normalizedOptions }];
    };

    if (typeof options.open === "undefined") {
      /** @type {NormalizedOpen[]} */
      (options.open) = [];
    } else if (typeof options.open === "boolean") {
      /** @type {NormalizedOpen[]} */
      (options.open) = options.open
        ? [
            {
              target: "<url>",
              options: /** @type {OpenOptions} */ (defaultOpenOptions),
            },
          ]
        : [];
    } else if (typeof options.open === "string") {
      /** @type {NormalizedOpen[]} */
      (options.open) = [{ target: options.open, options: defaultOpenOptions }];
    } else if (Array.isArray(options.open)) {
      /**
       * @type {NormalizedOpen[]}
       */
      const result = [];

      for (const item of options.open) {
        if (typeof item === "string") {
          result.push({ target: item, options: defaultOpenOptions });

          continue;
        }

        result.push(...getOpenItemsFromObject(item));
      }

      /** @type {NormalizedOpen[]} */
      (options.open) = result;
    } else {
      /** @type {NormalizedOpen[]} */
      (options.open) = [...getOpenItemsFromObject(options.open)];
    }

    if (typeof options.port === "string" && options.port !== "auto") {
      options.port = Number(options.port);
    }

    /**
     * Assume a proxy configuration specified as:
     * proxy: { 'context': { options } }
     * OR
     * proxy: { 'context': 'target' }
     */
    if (typeof options.proxy !== "undefined") {
      options.proxy = options.proxy.map((item) => {
        if (typeof item === "function") {
          return item;
        }

        if (typeof item.logger === "undefined") {
          item.logger = this.logger;
        }

        return item;
      });
    }

    if (typeof options.setupExitSignals === "undefined") {
      // In plugin mode, the host (e.g. `webpack-cli`) usually owns process
      // signal handling and calls `compiler.close()` on shutdown, which fires
      // our `shutdown` hook. Adding our own SIGINT/SIGTERM listeners on top of
      // that would race with the host's handler and call `compiler.close()`
      // twice.
      options.setupExitSignals = !this.isPlugin;
    }

    if (typeof options.static === "undefined") {
      options.static = [getStaticItem()];
    } else if (typeof options.static === "boolean") {
      options.static = options.static ? [getStaticItem()] : false;
    } else if (typeof options.static === "string") {
      options.static = [getStaticItem(options.static)];
    } else if (Array.isArray(options.static)) {
      options.static = options.static.map((item) => getStaticItem(item));
    } else {
      options.static = [getStaticItem(options.static)];
    }

    if (typeof options.watchFiles === "string") {
      options.watchFiles = [
        { paths: options.watchFiles, options: getWatchOptions() },
      ];
    } else if (
      typeof options.watchFiles === "object" &&
      options.watchFiles !== null &&
      !Array.isArray(options.watchFiles)
    ) {
      options.watchFiles = [
        {
          paths: options.watchFiles.paths,
          options: getWatchOptions(options.watchFiles.options || {}),
        },
      ];
    } else if (Array.isArray(options.watchFiles)) {
      options.watchFiles = options.watchFiles.map((item) => {
        if (typeof item === "string") {
          return { paths: item, options: getWatchOptions() };
        }

        return {
          paths: item.paths,
          options: getWatchOptions(item.options || {}),
        };
      });
    } else {
      options.watchFiles = [];
    }

    const defaultWebSocketServerType = "ws";
    const defaultWebSocketServerOptions = { path: "/ws" };

    if (typeof options.webSocketServer === "undefined") {
      options.webSocketServer = {
        type: defaultWebSocketServerType,
        options: defaultWebSocketServerOptions,
      };
    } else if (
      typeof options.webSocketServer === "boolean" &&
      !options.webSocketServer
    ) {
      options.webSocketServer = false;
    } else if (
      typeof options.webSocketServer === "string" ||
      typeof options.webSocketServer === "function"
    ) {
      options.webSocketServer = {
        type: options.webSocketServer,
        options: defaultWebSocketServerOptions,
      };
    } else {
      options.webSocketServer = {
        type:
          /** @type {WebSocketServerConfiguration} */
          (options.webSocketServer).type || defaultWebSocketServerType,
        options: {
          ...defaultWebSocketServerOptions,
          .../** @type {WebSocketServerConfiguration} */
          (options.webSocketServer).options,
        },
      };

      const webSocketServer =
        /** @type {{ type: WebSocketServerConfiguration["type"], options: NonNullable<WebSocketServerConfiguration["options"]> }} */
        (options.webSocketServer);

      if (typeof webSocketServer.options.port === "string") {
        webSocketServer.options.port = Number(webSocketServer.options.port);
      }
    }
  }

  /**
   * @returns {{ isColorSupported: () => boolean, colors: import("webpack").Colors }} colors support
   */
  #getColors() {
    const compilerOptions =
      /** @type {MultiCompiler} */
      (this.compiler).compilers
        ? /** @type {MultiCompiler} */ (this.compiler).compilers[0].webpack
        : /** @type {Compiler} */ (this.compiler).webpack;

    const colors = compilerOptions.cli.createColors({
      useColor: compilerOptions.cli.isColorSupported(),
    });

    return { isColorSupported: compilerOptions.cli.isColorSupported, colors };
  }

  /**
   * @private
   * @returns {string} client transport
   */
  getClientTransport() {
    let clientImplementation;
    let clientImplementationFound = true;

    const isKnownWebSocketServerImplementation =
      this.options.webSocketServer &&
      typeof (
        /** @type {WebSocketServerConfiguration} */
        (this.options.webSocketServer).type
      ) === "string" &&
      // @ts-expect-error
      this.options.webSocketServer.type === "ws";

    let clientTransport;

    if (this.options.client) {
      if (
        typeof (
          /** @type {ClientConfiguration} */
          (this.options.client).webSocketTransport
        ) !== "undefined"
      ) {
        clientTransport =
          /** @type {ClientConfiguration} */
          (this.options.client).webSocketTransport;
      } else if (isKnownWebSocketServerImplementation) {
        clientTransport =
          /** @type {WebSocketServerConfiguration} */
          (this.options.webSocketServer).type;
      } else {
        clientTransport = "ws";
      }
    } else {
      clientTransport = "ws";
    }

    switch (typeof clientTransport) {
      case "string":
        // could be 'ws', or a path that should be resolved
        if (clientTransport === "ws") {
          clientImplementation = cjsRequire.resolve(
            "../client/clients/WebSocketClient.js",
          );
        } else {
          try {
            clientImplementation = cjsRequire.resolve(clientTransport);
          } catch {
            clientImplementationFound = false;
          }
        }
        break;
      default:
        clientImplementationFound = false;
    }

    if (!clientImplementationFound) {
      throw new Error(
        `${
          !isKnownWebSocketServerImplementation
            ? "When you use custom web socket implementation you must explicitly specify client.webSocketTransport. "
            : ""
        }client.webSocketTransport must be a string denoting a default implementation (e.g. 'ws') or a resolvable module specifier or absolute file path which exports a class `,
      );
    }

    return /** @type {string} */ (clientImplementation);
  }

  /**
   * @template T
   * @private
   * @returns {Promise<T>} server transport
   */
  async getServerTransport() {
    let implementation;
    let implementationFound = true;

    switch (
      typeof (
        /** @type {WebSocketServerConfiguration} */
        (this.options.webSocketServer).type
      )
    ) {
      case "string":
        // Could be 'ws', or a path that should be required
        if (
          /** @type {WebSocketServerConfiguration} */ (
            this.options.webSocketServer
          ).type === "ws"
        ) {
          implementation = (await import("./servers/WebsocketServer.js"))
            .default;
        } else {
          try {
            const mod = cjsRequire(
              /** @type {string} */ (
                /** @type {WebSocketServerConfiguration} */
                (this.options.webSocketServer).type
              ),
            );

            implementation = mod.default || mod;
          } catch {
            implementationFound = false;
          }
        }
        break;
      case "function":
        implementation =
          /** @type {WebSocketServerConfiguration} */
          (this.options.webSocketServer).type;
        break;
      default:
        implementationFound = false;
    }

    if (!implementationFound) {
      throw new Error(
        "webSocketServer (webSocketServer.type) must be a string denoting a default implementation (e.g. 'ws'), a resolvable module specifier or absolute file path " +
          "which exports a class extending BaseServer (webpack-dev-server/lib/servers/BaseServer.js), " +
          "or the class itself which extends BaseServer",
      );
    }

    return implementation;
  }

  /**
   * @returns {string}
   */

  getClientEntry() {
    return cjsRequire.resolve("../client/index.js");
  }

  /**
   * @returns {string | void} client hot entry
   */
  getClientHotEntry() {
    if (this.options.hot === "only") {
      return cjsRequire.resolve("webpack/hot/only-dev-server");
    } else if (this.options.hot) {
      return cjsRequire.resolve("webpack/hot/dev-server");
    }
  }

  /**
   * @private
   * @returns {void}
   */
  setupProgressPlugin() {
    const { ProgressPlugin } =
      /** @type {MultiCompiler} */
      (this.compiler).compilers
        ? /** @type {MultiCompiler} */ (this.compiler).compilers[0].webpack
        : /** @type {Compiler} */ (this.compiler).webpack;

    new ProgressPlugin(
      /**
       * @param {number} percent percent
       * @param {string} msg message
       * @param {string} addInfo extra information
       * @param {string} pluginName plugin name
       */
      (percent, msg, addInfo, pluginName) => {
        percent = Math.floor(percent * 100);

        if (percent === 100) {
          msg = "Compilation completed";
        }

        if (addInfo) {
          msg = `${msg} (${addInfo})`;
        }

        if (this.webSocketServer) {
          this.sendMessage(this.webSocketServer.clients, "progress-update", {
            percent,
            msg,
            pluginName,
          });
        }

        if (this.server) {
          this.server.emit("progress-update", { percent, msg, pluginName });
        }
      },
    ).apply(/** @type {Compiler | MultiCompiler} */ (this.compiler));
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async initialize() {
    this.setupHooks();

    await this.setupApp();
    await this.createServer();

    if (this.options.webSocketServer) {
      const compilers =
        /** @type {MultiCompiler} */
        (this.compiler).compilers || [this.compiler];

      for (const compiler of compilers) {
        if (compiler.options.devServer === false) {
          continue;
        }

        await this.addAdditionalEntries(compiler);

        const webpack =
          compiler.webpack ||
          /** @type {NonNullable<Awaited<ReturnType<typeof loadWebpackPeer>>>} */ (
            await loadWebpackPeer()
          );

        new webpack.ProvidePlugin({
          __webpack_dev_server_client__: this.getClientTransport(),
        }).apply(compiler);

        // For universal targets `webpack/hot/emitter` uses Node's `events`,
        // which breaks in the browser. Swap it for webpack's `EventTarget`
        // emitter when available.
        if (
          compiler.options.output.module &&
          compiler.platform.web === null &&
          compiler.platform.node === null
        ) {
          let emitter;

          try {
            emitter = cjsRequire.resolve("webpack/hot/emitter-event-target.js");
          } catch {
            // older webpack versions do not ship the `EventTarget` emitter
          }

          if (emitter) {
            new webpack.NormalModuleReplacementPlugin(
              /emitter(\.js)?$/,
              (result) => {
                if (
                  /webpack[/\\]hot|webpack-dev-server[/\\]client/.test(
                    result.context,
                  )
                ) {
                  result.request = emitter;
                }
              },
            ).apply(compiler);
          }
        }

        if (this.options.hot) {
          const HMRPluginExists = compiler.options.plugins.find(
            (plugin) =>
              plugin &&
              plugin.constructor === webpack.HotModuleReplacementPlugin,
          );

          if (HMRPluginExists) {
            this.logger.warn(
              '"hot: true" automatically applies HMR plugin, you don\'t have to add it manually to your webpack configuration.',
            );
          } else {
            // Apply the HMR plugin
            const plugin = new webpack.HotModuleReplacementPlugin();

            plugin.apply(compiler);
          }
        }
      }

      if (
        this.options.client &&
        /** @type {ClientConfiguration} */ (this.options.client).progress
      ) {
        this.setupProgressPlugin();
      }
    }

    await this.setupWatchFiles();
    await this.setupWatchStaticFiles();
    await this.setupMiddlewares();

    if (this.options.setupExitSignals) {
      const signals = ["SIGINT", "SIGTERM"];

      let needForceShutdown = false;

      for (const signal of signals) {
        // eslint-disable-next-line no-loop-func
        const listener = () => {
          if (needForceShutdown) {
            // eslint-disable-next-line n/no-process-exit
            process.exit();
          }

          this.logger.info(
            "Gracefully shutting down. To force exit, press ^C again. Please wait...",
          );

          needForceShutdown = true;

          this.stopCallback(() => {
            if (typeof this.compiler?.close === "function") {
              this.compiler.close(() => {
                // eslint-disable-next-line n/no-process-exit
                process.exit();
              });
            } else {
              // eslint-disable-next-line n/no-process-exit
              process.exit();
            }
          });
        };

        this.listeners.push({ name: signal, listener });

        process.on(signal, listener);
      }
    }

    // Proxy WebSocket without the initial http request
    // https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
    const webSocketProxies =
      /** @type {RequestHandler[]} */
      (this.webSocketProxies);

    const hmrPath =
      this.options.webSocketServer &&
      /** @type {WebSocketServerConfiguration} */
      (this.options.webSocketServer).options &&
      /** @type {NonNullable<WebSocketServerConfiguration["options"]>} */
      (
        /** @type {WebSocketServerConfiguration} */
        (this.options.webSocketServer).options
      ).path;

    for (const webSocketProxy of webSocketProxies) {
      const proxyUpgrade =
        /** @type {RequestHandler & { upgrade: NonNullable<RequestHandler["upgrade"]> }} */
        (webSocketProxy).upgrade;

      /** @type {S} */
      (this.server).on("upgrade", (req, socket, head) => {
        if (hmrPath && typeof req.url === "string") {
          // Match the configured HMR path exactly the same way the underlying
          // WebSocket server (`ws`) does in `WebSocketServer#shouldHandle`: a
          // raw, case-sensitive comparison of the request target with the query
          // string stripped. Any normalization here would classify URL variants
          // (`//ws`, `/WS`, …) as the HMR socket even though `ws` refuses them.
          // https://github.com/websockets/ws/blob/8.18.3/lib/websocket-server.js#L214
          const queryIndex = req.url.indexOf("?");
          const pathname =
            queryIndex !== -1 ? req.url.slice(0, queryIndex) : req.url;
          if (pathname === hmrPath) {
            return;
          }
        }
        proxyUpgrade(req, socket, head);
      });
    }
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async setupApp() {
    /** @type {A | undefined} */
    this.app =
      /** @type {A} */
      (
        typeof this.options.app === "function"
          ? await this.options.app()
          : (await getExpress())()
      );
  }

  /**
   * @private
   * @param {Stats | MultiStats} statsObj stats
   * @returns {StatsCompilation} stats of compilation
   */
  getStats(statsObj) {
    const stats = Server.DEFAULT_STATS;
    const compilerOptions = this.getCompilerOptions();

    if (
      compilerOptions.stats &&
      /** @type {StatsOptions} */ (compilerOptions.stats).warningsFilter
    ) {
      stats.warningsFilter =
        /** @type {StatsOptions} */
        (compilerOptions.stats).warningsFilter;
    }

    return statsObj.toJson(stats);
  }

  /**
   * @private
   * @returns {void}
   */
  setupHooks() {
    const compiler = /** @type {Compiler | MultiCompiler} */ (this.compiler);

    compiler.hooks.invalid.tap(pluginName, () => {
      if (this.webSocketServer) {
        this.sendMessage(this.webSocketServer.clients, "invalid");
      }
    });

    compiler.hooks.done.tap(
      pluginName,
      /**
       * @param {Stats | MultiStats} stats stats
       */
      (stats) => {
        if (this.webSocketServer) {
          this.sendStats(this.webSocketServer.clients, this.getStats(stats));
        }

        /**
         * @private
         * @type {Stats | MultiStats}
         */
        this.stats = stats;
      },
    );
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async setupWatchStaticFiles() {
    const watchFiles = /** @type {NormalizedStatic[]} */ (this.options.static);

    if (watchFiles.length > 0) {
      for (const item of watchFiles) {
        if (item.watch) {
          await this.watchFiles(item.directory, item.watch);
        }
      }
    }
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async setupWatchFiles() {
    const watchFiles = /** @type {WatchFiles[]} */ (this.options.watchFiles);

    if (watchFiles.length > 0) {
      for (const item of watchFiles) {
        await this.watchFiles(item.paths, item.options);
      }
    }
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async setupMiddlewares() {
    if (this.compiler === undefined) return;
    /**
     * @type {Middleware[]}
     */
    let middlewares = [];

    // Register setup host header check for security
    middlewares.push({
      name: "host-header-check",
      /**
       * @param {Request} req request
       * @param {Response} res response
       * @param {NextFunction} next next function
       * @returns {void}
       */
      middleware: (req, res, next) => {
        const headers =
          /** @type {{ [key: string]: string | undefined }} */
          (req.headers);
        const headerName = headers[":authority"] ? ":authority" : "host";

        if (this.isValidHost(headers, headerName)) {
          next();
          return;
        }

        res.statusCode = 403;
        res.end("Invalid Host header");
      },
    });

    // Register setup cross origin request check for security
    middlewares.push({
      name: "cross-origin-header-check",
      /**
       * @param {Request} req request
       * @param {Response} res response
       * @param {NextFunction} next next function
       * @returns {void}
       */
      middleware: (req, res, next) => {
        const headers =
          /** @type {{ [key: string]: string | undefined }} */
          (req.headers);
        const headerName = headers[":authority"] ? ":authority" : "host";

        if (this.isValidHost(headers, headerName, false)) {
          next();
          return;
        }

        if (
          headers["sec-fetch-mode"] === "no-cors" &&
          headers["sec-fetch-site"] === "cross-site"
        ) {
          res.statusCode = 403;
          res.end("Cross-Origin request blocked");
          return;
        }

        // Block cross-origin resource loading when Sec-Fetch-* headers are absent (HTTP origins)
        if (
          this.options.allowedHosts !== "all" &&
          !this.isUserCORSWildcardEnabled()
        ) {
          res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
        }

        next();
      },
    });

    const isHTTP2 =
      /** @type {ServerConfiguration<A, S>} */ (this.options.server).type ===
      "http2";

    if (isHTTP2) {
      // TODO patch for https://github.com/pillarjs/finalhandler/pull/45, need remove then will be resolved
      middlewares.push({
        name: "http2-status-message-patch",
        middleware:
          /** @type {NextHandleFunction} */
          (_req, res, next) => {
            Object.defineProperty(res, "statusMessage", {
              get() {
                return "";
              },
              set() {},
            });

            next();
          },
      });
    }

    // compress is placed last and uses unshift so that it will be the first middleware used
    if (this.options.compress) {
      const { default: compression } = await import("compression");

      middlewares.push({ name: "compression", middleware: compression() });
    }

    if (typeof this.options.headers !== "undefined") {
      middlewares.push({
        name: "set-headers",
        middleware: this.setHeaders.bind(this),
      });
    }

    middlewares.push({
      name: "webpack-dev-middleware",
      middleware: /** @type {MiddlewareHandler} */ (this.middleware),
    });

    middlewares.push({
      name: "webpack-dev-server-invalidate",
      path: "/webpack-dev-server/invalidate",
      /**
       * @param {Request} req request
       * @param {Response} res response
       * @param {NextFunction} next next function
       * @returns {void}
       */
      middleware: (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        if (!this.#isSameOriginRequest(req)) {
          res.statusCode = 403;
          res.end("Cross-Origin request blocked");
          return;
        }

        this.invalidate();

        res.end();
      },
    });

    middlewares.push({
      name: "webpack-dev-server-open-editor",
      path: "/webpack-dev-server/open-editor",
      /**
       * @param {Request} req request
       * @param {Response} res response
       * @param {NextFunction} next next function
       * @returns {Promise<void>}
       */
      middleware: async (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        if (!this.#isSameOriginRequest(req)) {
          res.statusCode = 403;
          res.end("Cross-Origin request blocked");
          return;
        }

        if (!req.url) {
          next();
          return;
        }

        const resolveUrl = new URL(req.url, `http://${req.headers.host}`);
        const params = new URLSearchParams(resolveUrl.search);
        const fileName = params.get("fileName");

        if (typeof fileName === "string") {
          const { default: launchEditor } = await import("launch-editor");

          launchEditor(fileName);
        }

        res.end();
      },
    });

    middlewares.push({
      name: "webpack-dev-server-assets",
      path: "/webpack-dev-server",
      /**
       * @param {Request} req request
       * @param {Response} res response
       * @param {NextFunction} next next function
       * @returns {void}
       */
      middleware: (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        if (!this.middleware) {
          next();
          return;
        }

        this.middleware.waitUntilValid((stats) => {
          res.setHeader("Content-Type", "text/html; charset=utf-8");

          // HEAD requests should not return body content
          if (req.method === "HEAD") {
            res.end();
            return;
          }

          res.write(
            '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>',
          );

          /**
           * @type {StatsCompilation[]}
           */
          const statsForPrint =
            typeof (/** @type {MultiStats} */ (stats).stats) !== "undefined"
              ? /** @type {NonNullable<StatsCompilation["children"]>} */
                (/** @type {MultiStats} */ (stats).toJson().children)
              : [/** @type {Stats} */ (stats).toJson()];

          res.write("<h1>Assets Report:</h1>");

          for (const [index, item] of statsForPrint.entries()) {
            res.write("<div>");

            const name =
              typeof item.name !== "undefined"
                ? item.name
                : /** @type {MultiStats} */ (stats).stats
                  ? `unnamed[${index}]`
                  : "unnamed";

            res.write(`<h2>Compilation: ${name}</h2>`);
            res.write("<ul>");

            const publicPath =
              item.publicPath === "auto" ? "" : item.publicPath;
            const assets =
              /** @type {NonNullable<StatsCompilation["assets"]>} */
              (item.assets);

            for (const asset of assets) {
              const assetName = asset.name;
              const assetURL = `${publicPath}${assetName}`;

              res.write(
                `<li>
              <strong><a href="${assetURL}" target="_blank">${assetName}</a></strong>
            </li>`,
              );
            }

            res.write("</ul>");
            res.write("</div>");
          }

          res.end("</body></html>");
        });
      },
    });

    if (this.options.proxy) {
      const { createProxyMiddleware } = await import("http-proxy-middleware");

      /**
       * @param {ProxyConfigArrayItem} proxyConfig proxy config
       * @returns {RequestHandler | undefined} request handler
       */
      const getProxyMiddleware = (proxyConfig) => {
        const context =
          proxyConfig.context || proxyConfig.path || proxyConfig.pathFilter;

        return createProxyMiddleware({
          ...proxyConfig,
          pathFilter: /** @type {string} */ (context),
        });
      };

      /**
       * @example
       * Assume a proxy configuration specified as:
       * proxy: [
       *   {
       *     context: "value",
       *     ...options,
       *   },
       *   // or:
       *   function() {
       *     return {
       *       context: "context",
       *       ...options,
       *     };
       *   }
       * ]
       */
      for (const proxyConfigOrCallback of this.options.proxy) {
        /**
         * @type {RequestHandler}
         */
        let proxyMiddleware;

        let proxyConfig =
          typeof proxyConfigOrCallback === "function"
            ? proxyConfigOrCallback()
            : proxyConfigOrCallback;

        proxyMiddleware =
          /** @type {RequestHandler} */
          (getProxyMiddleware(proxyConfig));

        if (proxyConfig.ws) {
          this.webSocketProxies.push(proxyMiddleware);
        }

        /**
         * @param {Request} req request
         * @param {Response} res response
         * @param {NextFunction} next next function
         * @returns {Promise<void>}
         */
        const handler = async (req, res, next) => {
          if (typeof proxyConfigOrCallback === "function") {
            const newProxyConfig = proxyConfigOrCallback(req, res, next);

            if (newProxyConfig !== proxyConfig) {
              proxyConfig = newProxyConfig;

              const socket = req.socket || req.connection;
              // @ts-expect-error
              const server = socket ? socket.server : null;

              if (server) {
                server.removeAllListeners("close");
              }

              proxyMiddleware =
                /** @type {RequestHandler} */
                (getProxyMiddleware(proxyConfig));
            }
          }

          return proxyMiddleware(req, res, next);
        };

        middlewares.push({
          name: "http-proxy-middleware",
          middleware: handler,
        });

        // Also forward error requests to the proxy so it can handle them.
        middlewares.push({
          name: "http-proxy-middleware-error-handler",
          middleware:
            /**
             * @param {Error} error error
             * @param {Request} req request
             * @param {Response} res response
             * @param {NextFunction} next next function
             * @returns {Promise<void>} nothing
             */
            (error, req, res, next) => handler(req, res, next),
        });
      }

      middlewares.push({
        name: "webpack-dev-middleware",
        middleware: /** @type {MiddlewareHandler} */ (this.middleware),
      });
    }

    const staticOptions =
      /** @type {NormalizedStatic[]} */
      (this.options.static);

    if (staticOptions.length > 0) {
      for (const staticOption of staticOptions) {
        for (const publicPath of staticOption.publicPath) {
          middlewares.push({
            name: "express-static",
            path: publicPath,
            middleware: (await getExpress()).static(
              staticOption.directory,
              staticOption.staticOptions,
            ),
          });
        }
      }
    }

    if (this.options.historyApiFallback) {
      const { default: connectHistoryApiFallback } = await import(
        "connect-history-api-fallback"
      );

      const { historyApiFallback } = this.options;

      if (
        typeof (
          /** @type {ConnectHistoryApiFallbackOptions} */
          (historyApiFallback).logger
        ) === "undefined" &&
        !(
          /** @type {ConnectHistoryApiFallbackOptions} */
          (historyApiFallback).verbose
        )
      ) {
        // @ts-expect-error
        historyApiFallback.logger = this.logger.log.bind(
          this.logger,
          "[connect-history-api-fallback]",
        );
      }

      // Fall back to /index.html if nothing else matches.
      middlewares.push({
        name: "connect-history-api-fallback",
        middleware: connectHistoryApiFallback(
          /** @type {ConnectHistoryApiFallbackOptions} */
          (historyApiFallback),
        ),
      });

      // include our middleware to ensure
      // it is able to handle '/index.html' request after redirect
      middlewares.push({
        name: "webpack-dev-middleware",
        middleware: /** @type {MiddlewareHandler} */ (this.middleware),
      });

      if (staticOptions.length > 0) {
        for (const staticOption of staticOptions) {
          for (const publicPath of staticOption.publicPath) {
            middlewares.push({
              name: "express-static",
              path: publicPath,
              middleware: (await getExpress()).static(
                staticOption.directory,
                staticOption.staticOptions,
              ),
            });
          }
        }
      }
    }

    if (staticOptions.length > 0) {
      const { default: serveIndex } = await import("serve-index");

      for (const staticOption of staticOptions) {
        for (const publicPath of staticOption.publicPath) {
          if (staticOption.serveIndex) {
            middlewares.push({
              name: "serve-index",
              path: publicPath,
              /**
               * @param {Request} req request
               * @param {Response} res response
               * @param {NextFunction} next next function
               * @returns {void}
               */
              middleware: (req, res, next) => {
                // serve-index doesn't fallthrough non-get/head request to next middleware
                if (req.method !== "GET" && req.method !== "HEAD") {
                  return next();
                }

                serveIndex(
                  staticOption.directory,
                  /** @type {ServeIndexOptions} */
                  (staticOption.serveIndex),
                )(req, res, next);
              },
            });
          }
        }
      }
    }

    // Register this middleware always as the last one so that it's only used as a
    // fallback when no other middleware responses.
    middlewares.push({
      name: "options-middleware",
      /**
       * @param {Request} req request
       * @param {Response} res response
       * @param {NextFunction} next next function
       * @returns {void}
       */
      middleware: (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Content-Length", "0");
          res.end();
          return;
        }
        next();
      },
    });

    if (typeof this.options.setupMiddlewares === "function") {
      middlewares = this.options.setupMiddlewares(middlewares, this);
    }

    // Lazy init webpack dev middleware
    const lazyInitDevMiddleware = async () => {
      if (!this.middleware) {
        const { default: webpackDevMiddleware } = await import(
          "webpack-dev-middleware"
        );

        // middleware for serving webpack bundle
        /** @type {import("webpack-dev-middleware").API<Request, Response>} */
        this.middleware = webpackDevMiddleware(
          // @ts-expect-error
          this.compiler,
          this.options.devMiddleware,
          this.isPlugin,
        );
      }

      return this.middleware;
    };

    for (const i of middlewares) {
      if (i.name === "webpack-dev-middleware") {
        const item = /** @type {MiddlewareObject} */ (i);

        if (typeof item.middleware === "undefined") {
          item.middleware = await lazyInitDevMiddleware();
        }
      }
    }

    for (const middleware of middlewares) {
      if (typeof middleware === "function") {
        /** @type {A} */
        (this.app).use(
          /** @type {NextHandleFunction | HandleFunction} */
          (middleware),
        );
      } else if (typeof middleware.path !== "undefined") {
        /** @type {A} */
        (this.app).use(
          middleware.path,
          /** @type {SimpleHandleFunction | NextHandleFunction} */
          (middleware.middleware),
        );
      } else {
        /** @type {A} */
        (this.app).use(
          /** @type {NextHandleFunction | HandleFunction} */
          (middleware.middleware),
        );
      }
    }
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async createServer() {
    const { type, options } =
      /** @type {ServerConfiguration<A, S>} */
      (this.options.server);

    if (typeof type === "function") {
      /** @type {S | undefined} */
      this.server = await type(
        /** @type {ServerOptions} */
        (options),
        /** @type {A} */
        (this.app),
      );
    } else {
      const mod = cjsRequire(/** @type {string} */ (type));

      const serverType = mod.default || mod;

      /** @type {S | undefined} */
      this.server =
        type === "http2"
          ? serverType.createSecureServer(
              { ...options, allowHTTP1: true },
              this.app,
            )
          : serverType.createServer(options, this.app);
    }

    this.isTlsServer =
      typeof (
        /** @type {import("tls").Server} */ (this.server).setSecureContext
      ) !== "undefined";

    /** @type {S} */
    (this.server).on(
      "connection",
      /**
       * @param {Socket} socket connected socket
       */
      (socket) => {
        // Add socket to list
        this.sockets.push(socket);

        socket.once("close", () => {
          // Remove socket from list
          this.sockets.splice(this.sockets.indexOf(socket), 1);
        });
      },
    );

    /** @type {S} */
    (this.server).on(
      "error",
      /**
       * @param {Error} error error
       */
      (error) => {
        throw error;
      },
    );
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async createWebSocketServer() {
    /** @type {WebSocketServerImplementation | undefined | null} */
    this.webSocketServer = new (await this.getServerTransport())(this);

    /** @type {WebSocketServerImplementation} */
    (this.webSocketServer).implementation.on(
      "connection",
      /**
       * @param {ClientConnection} client client
       * @param {IncomingMessage} request request
       */
      (client, request) => {
        /** @type {{ [key: string]: string | undefined } | undefined} */
        const headers =
          typeof request !== "undefined"
            ? /** @type {{ [key: string]: string | undefined }} */
              (request.headers)
            : undefined;

        if (!headers) {
          this.logger.warn(
            'webSocketServer implementation must pass headers for the "connection" event',
          );
        }

        if (
          !headers ||
          !this.isValidHost(headers, "host") ||
          !this.isValidHost(headers, "origin") ||
          !this.isSameOrigin(headers)
        ) {
          this.sendMessage([client], "error", "Invalid Host/Origin header");

          // With https enabled, the sendMessage above is encrypted asynchronously so not yet sent
          // Terminate would prevent it sending, so use close to allow it to be sent
          client.close();

          return;
        }

        if (this.options.hot === true || this.options.hot === "only") {
          this.sendMessage([client], "hot");
        }

        if (this.options.liveReload) {
          this.sendMessage([client], "liveReload");
        }

        if (
          this.options.client &&
          /** @type {ClientConfiguration} */
          (this.options.client).progress
        ) {
          this.sendMessage(
            [client],
            "progress",
            /** @type {ClientConfiguration} */
            (this.options.client).progress,
          );
        }

        if (
          this.options.client &&
          /** @type {ClientConfiguration} */
          (this.options.client).reconnect
        ) {
          this.sendMessage(
            [client],
            "reconnect",
            /** @type {ClientConfiguration} */
            (this.options.client).reconnect,
          );
        }

        if (
          this.options.client &&
          /** @type {ClientConfiguration} */
          (this.options.client).overlay
        ) {
          const overlayConfig =
            /** @type {ClientConfiguration} */
            (this.options.client).overlay;

          this.sendMessage(
            [client],
            "overlay",
            typeof overlayConfig === "object"
              ? {
                  ...overlayConfig,
                  errors:
                    overlayConfig.errors &&
                    encodeOverlaySettings(overlayConfig.errors),
                  warnings:
                    overlayConfig.warnings &&
                    encodeOverlaySettings(overlayConfig.warnings),
                  runtimeErrors:
                    overlayConfig.runtimeErrors &&
                    encodeOverlaySettings(overlayConfig.runtimeErrors),
                }
              : overlayConfig,
          );
        }

        if (!this.stats) {
          return;
        }

        this.sendStats([client], this.getStats(this.stats), true);
      },
    );
  }

  /**
   * @private
   * @param {string} defaultOpenTarget default open target
   * @returns {Promise<void>}
   */
  async openBrowser(defaultOpenTarget) {
    const open = (await import("open")).default;

    Promise.all(
      /** @type {NormalizedOpen[]} */
      (this.options.open).map((item) => {
        /**
         * @type {string}
         */
        let openTarget;

        if (item.target === "<url>") {
          openTarget = defaultOpenTarget;
        } else {
          openTarget = Server.isAbsoluteURL(item.target)
            ? item.target
            : new URL(item.target, defaultOpenTarget).toString();
        }

        return open(openTarget, item.options).catch(() => {
          this.logger.warn(
            `Unable to open "${openTarget}" page${
              item.options.app
                ? ` in "${
                    /** @type {import("open").App} */
                    (item.options.app).name
                  }" app${
                    /** @type {import("open").App} */
                    (item.options.app).arguments
                      ? ` with "${
                          /** @type {import("open").App} */
                          (item.options.app).arguments.join(" ")
                        }" arguments`
                      : ""
                  }`
                : ""
            }. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app-name".`,
          );
        });
      }),
    );
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async runBonjour() {
    const { Bonjour } = await import("bonjour-service");

    const type = this.isTlsServer ? "https" : "http";

    /**
     * @private
     * @type {Bonjour | undefined}
     */
    this.bonjour = new Bonjour();
    this.bonjour.publish({
      name: `Webpack Dev Server ${os.hostname()}:${this.options.port}`,
      port: /** @type {number} */ (this.options.port),
      type,
      subtypes: ["webpack"],
      .../** @type {Partial<BonjourOptions>} */ (this.options.bonjour),
    });
  }

  /**
   * @private
   * @param {() => void} callback callback
   * @returns {void}
   */
  stopBonjour(callback = () => {}) {
    /** @type {Bonjour} */
    (this.bonjour).unpublishAll(() => {
      /** @type {Bonjour} */
      (this.bonjour).destroy();

      if (callback) {
        callback();
      }
    });
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async logStatus() {
    const {
      isColorSupported,
      colors: { cyan, red },
    } = this.#getColors();

    /**
     * @param {Compiler["options"]} compilerOptions compiler options
     * @returns {boolean} value of the color option
     */
    const getColorsOption = (compilerOptions) => {
      /**
       * @type {boolean}
       */
      let colorsEnabled;

      if (
        compilerOptions.stats &&
        typeof (/** @type {StatsOptions} */ (compilerOptions.stats).colors) !==
          "undefined"
      ) {
        colorsEnabled =
          /** @type {boolean} */
          (/** @type {StatsOptions} */ (compilerOptions.stats).colors);
      } else {
        colorsEnabled = isColorSupported();
      }

      return colorsEnabled;
    };

    const colors = {
      /**
       * @param {boolean} useColor need to use color?
       * @param {string} msg message
       * @returns {string} message with color
       */
      info(useColor, msg) {
        if (useColor) {
          return cyan(msg);
        }

        return msg;
      },
      /**
       * @param {boolean} useColor need to use color?
       * @param {string} msg message
       * @returns {string} message with colors
       */
      error(useColor, msg) {
        if (useColor) {
          return red(msg);
        }

        return msg;
      },
    };
    const useColor = getColorsOption(this.getCompilerOptions());

    const server = /** @type {S} */ (this.server);

    if (this.options.ipc) {
      this.logger.info(`Project is running at: "${server.address()}"`);
    } else {
      const protocol = this.isTlsServer ? "https" : "http";
      const { address, port } =
        /** @type {import("net").AddressInfo} */
        (server.address());
      /**
       * @param {string} newHostname new hostname
       * @returns {string} prettified URL
       */
      const prettyPrintURL = (newHostname) =>
        url.format({ protocol, hostname: newHostname, port, pathname: "/" });

      let host;
      let localhost;
      let loopbackIPv4;
      let loopbackIPv6;
      let networkUrlIPv4;
      let networkUrlIPv6;

      if (this.options.host) {
        if (this.options.host === "localhost") {
          localhost = prettyPrintURL("localhost");
        } else {
          let isIP;

          try {
            isIP = ipaddr.parse(this.options.host);
          } catch {
            // Ignore
          }

          if (!isIP) {
            host = prettyPrintURL(this.options.host);
          }
        }
      }

      const parsedIP = ipaddr.parse(address);

      if (parsedIP.range() === "unspecified") {
        localhost = prettyPrintURL("localhost");
        loopbackIPv6 = prettyPrintURL("::1");

        const networkIPv4 = Server.findIp("v4", false);

        if (networkIPv4) {
          networkUrlIPv4 = prettyPrintURL(networkIPv4);
        }

        const networkIPv6 = Server.findIp("v6", false);

        if (networkIPv6) {
          networkUrlIPv6 = prettyPrintURL(networkIPv6);
        }
      } else if (parsedIP.range() === "loopback") {
        if (parsedIP.kind() === "ipv4") {
          loopbackIPv4 = prettyPrintURL(parsedIP.toString());
        } else if (parsedIP.kind() === "ipv6") {
          loopbackIPv6 = prettyPrintURL(parsedIP.toString());
        }
      } else {
        networkUrlIPv4 =
          parsedIP.kind() === "ipv6" &&
          /** @type {IPv6} */
          (parsedIP).isIPv4MappedAddress()
            ? prettyPrintURL(
                /** @type {IPv6} */
                (parsedIP).toIPv4Address().toString(),
              )
            : prettyPrintURL(address);

        if (parsedIP.kind() === "ipv6") {
          networkUrlIPv6 = prettyPrintURL(address);
        }
      }

      this.logger.info("Project is running at:");

      if (host) {
        this.logger.info(`Server: ${colors.info(useColor, host)}`);
      }

      if (localhost || loopbackIPv4 || loopbackIPv6) {
        const loopbacks = [];

        if (localhost) {
          loopbacks.push([colors.info(useColor, localhost)]);
        }

        if (loopbackIPv4) {
          loopbacks.push([colors.info(useColor, loopbackIPv4)]);
        }

        if (loopbackIPv6) {
          loopbacks.push([colors.info(useColor, loopbackIPv6)]);
        }

        this.logger.info(`Loopback: ${loopbacks.join(", ")}`);
      }

      if (networkUrlIPv4) {
        this.logger.info(
          `On Your Network (IPv4): ${colors.info(useColor, networkUrlIPv4)}`,
        );
      }

      if (networkUrlIPv6) {
        this.logger.info(
          `On Your Network (IPv6): ${colors.info(useColor, networkUrlIPv6)}`,
        );
      }

      if (/** @type {NormalizedOpen[]} */ (this.options.open).length > 0) {
        const openTarget = prettyPrintURL(
          !this.options.host ||
            this.options.host === "0.0.0.0" ||
            this.options.host === "::"
            ? "localhost"
            : this.options.host,
        );

        await this.openBrowser(openTarget);
      }
    }

    if (/** @type {NormalizedStatic[]} */ (this.options.static).length > 0) {
      this.logger.info(
        `Content not from webpack is served from '${colors.info(
          useColor,
          /** @type {NormalizedStatic[]} */
          (this.options.static)
            .map((staticOption) => staticOption.directory)
            .join(", "),
        )}' directory`,
      );
    }

    if (this.options.historyApiFallback) {
      this.logger.info(
        `404s will fallback to '${colors.info(
          useColor,
          /** @type {ConnectHistoryApiFallbackOptions} */ (
            this.options.historyApiFallback
          ).index || "/index.html",
        )}'`,
      );
    }

    if (this.options.bonjour) {
      const bonjourProtocol =
        /** @type {BonjourOptions} */
        (this.options.bonjour).type || this.isTlsServer ? "https" : "http";

      this.logger.info(
        `Broadcasting "${bonjourProtocol}" with subtype of "webpack" via ZeroConf DNS (Bonjour)`,
      );
    }
  }

  /**
   * @private
   * @param {Request} req request
   * @param {Response} res response
   * @param {NextFunction} next next function
   */
  setHeaders(req, res, next) {
    let { headers } = this.options;

    if (headers) {
      if (typeof headers === "function") {
        headers = headers(
          req,
          res,

          this.middleware ? this.middleware.context : undefined,
        );
      }

      /**
       * @type {{ key: string, value: string }[]}
       */
      const allHeaders = [];

      if (!Array.isArray(headers)) {
        for (const name in headers) {
          allHeaders.push({
            key: name,
            value: /** @type {string} */ (headers[name]),
          });
        }

        headers = allHeaders;
      }

      for (const { key, value } of headers) {
        res.setHeader(key, value);
      }
    }

    next();
  }

  /**
   * @private
   * @param {string} value value
   * @returns {boolean} true when host allowed, otherwise false
   */
  isHostAllowed(value) {
    const { allowedHosts } = this.options;

    // allow user to opt out of this security check, at their own risk
    // by explicitly enabling allowedHosts
    if (allowedHosts === "all") {
      return true;
    }

    // always allow localhost host, for convenience
    // allow if value is in allowedHosts
    if (Array.isArray(allowedHosts) && allowedHosts.length > 0) {
      for (const allowedHost of allowedHosts) {
        if (allowedHost === value) {
          return true;
        }

        // support "." as a subdomain wildcard
        // e.g. ".example.com" will allow "example.com", "www.example.com", "subdomain.example.com", etc
        if (
          allowedHost.startsWith(".") && // "example.com"  (value === allowedHost.substring(1))
          // "*.example.com"  (value.endsWith(allowedHost))
          (value === allowedHost.slice(1) ||
            /** @type {string} */
            (value).endsWith(allowedHost))
        ) {
          return true;
        }
      }
    }

    // Also allow if `client.webSocketURL.hostname` provided
    if (
      this.options.client &&
      typeof (
        /** @type {ClientConfiguration} */
        (this.options.client).webSocketURL
      ) !== "undefined"
    ) {
      return (
        /** @type {WebSocketURL} */
        (/** @type {ClientConfiguration} */ (this.options.client).webSocketURL)
          .hostname === value
      );
    }

    return false;
  }

  /**
   * Extracts and normalizes the hostname from a header, removing brackets for IPv6.
   * @param {string} header header value
   * @returns {string | null} hostname or null
   */
  #parseHostnameFromHeader = function (header) {
    if (!header) return null;

    try {
      // If the header does not have a scheme, prepend // so URL can parse it
      const parseUrl = new URL(
        /^(.+:)?\/\//.test(header) ? header : `//${header}`,
        "http://localhost/",
      );

      let hostname = parseUrl.hostname;
      // Normalize IPv6: remove brackets if present
      if (hostname.startsWith("[") && hostname.endsWith("]")) {
        hostname = hostname.slice(1, -1);
      }

      return hostname;
    } catch {
      return null;
    }
  };

  /**
   * @private
   * @returns {boolean} true when the user has configured a wildcard
   * Access-Control-Allow-Origin header (opting into fully open cross-origin access)
   */
  isUserCORSWildcardEnabled() {
    const { headers } = this.options;

    if (!headers) {
      return false;
    }

    if (typeof headers === "function") {
      return false;
    }

    /**
     * @param {string | string[]} value header value
     * @returns {boolean} true when value is the "*" wildcard
     */
    const isWildcard = (value) => {
      if (typeof value === "string") {
        return value.trim() === "*";
      }

      if (Array.isArray(value)) {
        return value.length === 1 && isWildcard(value[0]);
      }

      return false;
    };

    if (Array.isArray(headers)) {
      return headers.some(
        (header) =>
          header.key.toLowerCase() === "access-control-allow-origin" &&
          isWildcard(header.value),
      );
    }

    return Object.entries(headers).some(
      ([key, value]) =>
        key.toLowerCase() === "access-control-allow-origin" &&
        isWildcard(value),
    );
  }

  /**
   * @private
   * @param {{ [key: string]: string | undefined }} headers headers
   * @param {string} headerToCheck header to check
   * @param {boolean} validateHost need to validate host
   * @returns {boolean} true when host is valid, otherwise false
   */
  isValidHost(headers, headerToCheck, validateHost = true) {
    if (this.options.allowedHosts === "all") {
      return true;
    }

    // get the Host header and extract hostname
    // we don't care about port not matching
    const header = headers[headerToCheck];

    if (!header) {
      return false;
    }

    if (DEFAULT_ALLOWED_PROTOCOLS.test(header)) {
      return true;
    }

    const hostname = this.#parseHostnameFromHeader(header);

    if (hostname === null) {
      return false;
    }

    if (this.isHostAllowed(hostname)) {
      return true;
    }

    // always allow requests with explicit IPv4 or IPv6-address.
    // A note on IPv6 addresses:
    // header will always contain the brackets denoting
    // an IPv6-address in URLs,
    // these aren't removed from the hostname in new URL(),
    // For convenience, always allow localhost (hostname === 'localhost')
    // and its subdomains (hostname.endsWith(".localhost")).
    // allow hostname of listening address  (hostname === this.options.host)
    const isValidHostname = validateHost
      ? ipaddr.IPv4.isValid(hostname) ||
        ipaddr.IPv6.isValid(hostname) ||
        hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        hostname === this.options.host
      : false;

    return isValidHostname;
  }

  /**
   * @private
   * @param {{ [key: string]: string | undefined }} headers headers
   * @returns {boolean} true when is same origin, otherwise false
   */
  isSameOrigin(headers) {
    if (this.options.allowedHosts === "all") {
      return true;
    }

    const originHeader = headers.origin;

    if (!originHeader) {
      return this.options.allowedHosts === "all";
    }

    if (DEFAULT_ALLOWED_PROTOCOLS.test(originHeader)) {
      return true;
    }

    const origin = this.#parseHostnameFromHeader(originHeader);

    if (origin === null) {
      return false;
    }

    if (this.isHostAllowed(origin)) {
      return true;
    }

    const hostHeader = headers.host;

    if (!hostHeader) {
      return this.options.allowedHosts === "all";
    }

    if (DEFAULT_ALLOWED_PROTOCOLS.test(hostHeader)) {
      return true;
    }

    const host = this.#parseHostnameFromHeader(hostHeader);

    if (host === null) {
      return false;
    }

    if (this.isHostAllowed(host)) {
      return true;
    }

    // Treat all loopback aliases as equivalent: localhost may resolve to
    // 127.0.0.1 or ::1 depending on the OS, causing a false mismatch.
    // Only widen when allowedHosts is "auto" (default) or already permits a
    // loopback alias, so an explicit allow-list excluding loopback is honored.
    const loopbacks = new Set(["localhost", "127.0.0.1", "::1"]);
    const loopbackPermitted =
      this.options.allowedHosts === "auto" ||
      [...loopbacks].some((alias) => this.isHostAllowed(alias));
    if (loopbacks.has(origin) && loopbacks.has(host) && loopbackPermitted) {
      return true;
    }

    return origin === host;
  }

  /**
   * Determines whether a request was initiated from the dev server's own
   * origin, to reject cross-site request forgery on state-changing endpoints.
   * @param {Request} req request
   * @returns {boolean} true when the request can be trusted as same-origin
   */
  #isSameOriginRequest(req) {
    const headers =
      /** @type {{ [key: string]: string | undefined }} */
      (req.headers);

    const secFetchSite = headers["sec-fetch-site"];

    // Prefer `Sec-Fetch-Site`: browsers send it even for same-origin GET
    // `fetch`es (which omit `Origin`), and a cross-site page cannot forge it.
    // `none` is a user-initiated navigation.
    if (typeof secFetchSite === "string") {
      return secFetchSite === "same-origin" || secFetchSite === "none";
    }

    // Without `Sec-Fetch-*` metadata (non-browser/legacy clients): a request
    // with no `Origin` header was not initiated by another origin's script;
    // otherwise fall back to the `Origin`/`Host` comparison.
    if (typeof headers.origin !== "string") {
      return true;
    }

    return this.isSameOrigin(headers);
  }

  /**
   * @param {ClientConnection[]} clients clients
   * @param {string} type type
   * @param {EXPECTED_ANY=} data data
   * @param {EXPECTED_ANY=} params params
   */
  sendMessage(clients, type, data, params) {
    for (const client of clients) {
      // `ws` uses `WebSocket.OPEN`, which is `1`
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type, data, params }));
      }
    }
  }

  // Send stats to a socket or multiple sockets
  /**
   * @private
   * @param {ClientConnection[]} clients clients
   * @param {StatsCompilation} stats stats
   * @param {boolean=} force force
   */
  sendStats(clients, stats, force) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      this.currentHash === stats.hash;

    if (shouldEmit) {
      this.sendMessage(clients, "still-ok");

      return;
    }

    this.currentHash = stats.hash;
    this.sendMessage(clients, "hash", stats.hash);

    if (
      /** @type {NonNullable<StatsCompilation["errors"]>} */
      (stats.errors).length > 0 ||
      /** @type {NonNullable<StatsCompilation["warnings"]>} */
      (stats.warnings).length > 0
    ) {
      const hasErrors =
        /** @type {NonNullable<StatsCompilation["errors"]>} */
        (stats.errors).length > 0;

      if (
        /** @type {NonNullable<StatsCompilation["warnings"]>} */
        (stats.warnings).length > 0
      ) {
        let params;

        if (hasErrors) {
          params = { preventReloading: true };
        }

        this.sendMessage(clients, "warnings", stats.warnings, params);
      }

      if (
        /** @type {NonNullable<StatsCompilation["errors"]>} */ (stats.errors)
          .length > 0
      ) {
        this.sendMessage(clients, "errors", stats.errors);
      }
    } else {
      this.sendMessage(clients, "ok");
    }
  }

  /**
   * @param {string | string[]} watchPath watch path
   * @param {WatchOptions=} watchOptions watch options
   * @returns {Promise<void>}
   */
  async watchFiles(watchPath, watchOptions = {}) {
    const { default: chokidar } = await import("chokidar");
    const { globSync, isDynamicPattern } = await import("tinyglobby");

    const isWin = path.sep === "\\";
    const toPosix = (/** @type {string} */ filePath) =>
      isWin ? filePath.split(path.sep).join("/") : filePath;
    const toNative = (/** @type {string} */ filePath) =>
      isWin ? filePath.split("/").join(path.sep) : filePath;

    const cwd = watchOptions.cwd ? toPosix(watchOptions.cwd) : undefined;

    const expand = (/** @type {string} */ item) => {
      const posix = toPosix(item);
      return isDynamicPattern(posix)
        ? globSync(posix, { cwd, absolute: true }).map(toNative)
        : item;
    };

    const resolveGlobs = (/** @type {string | string[]} */ input) =>
      (Array.isArray(input) ? input : [input]).flatMap((item) =>
        typeof item === "string" ? expand(item) : item,
      );

    const resolvedPaths = resolveGlobs(watchPath);

    if (typeof watchOptions.ignored === "string") {
      watchOptions.ignored = resolveGlobs(watchOptions.ignored);
    } else if (Array.isArray(watchOptions.ignored)) {
      watchOptions.ignored = watchOptions.ignored.flatMap((item) =>
        typeof item === "string" ? expand(item) : item,
      );
    }

    const watcher = chokidar.watch(resolvedPaths, watchOptions);

    // disabling refreshing on changing the content
    if (this.options.liveReload) {
      watcher.on("change", (item) => {
        if (this.webSocketServer) {
          this.sendMessage(
            this.webSocketServer.clients,
            "static-changed",
            item,
          );
        }
      });
    }

    this.staticWatchers.push(watcher);
  }

  /**
   * @param {import("webpack-dev-middleware").Callback=} callback callback
   */
  invalidate(callback = () => {}) {
    // In plugin mode the host owns `compiler.watch()`, so the middleware has no
    // `watching` of its own — invalidate the host's watching(s) directly to
    // trigger a rebuild (each child's own `watching` for a `MultiCompiler`).
    if (this.isPlugin) {
      const compilers =
        /** @type {MultiCompiler} */ (this.compiler).compilers ||
        /** @type {Compiler[]} */ ([this.compiler]);

      /** @type {NonNullable<Compiler["watching"]>[]} */
      const watchings = [];

      for (const compiler of compilers) {
        if (compiler.watching) {
          watchings.push(compiler.watching);
        }
      }

      if (watchings.length === 0) {
        callback();
        return;
      }

      let pending = watchings.length;

      const onInvalidated = () => {
        pending -= 1;

        if (pending === 0) {
          callback();
        }
      };

      for (const watching of watchings) {
        watching.invalidate(onInvalidated);
      }

      return;
    }

    if (this.middleware) {
      this.middleware.invalidate(callback);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async start() {
    await this.setup();
    await this.listen();
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async setup() {
    await this.normalizeOptions();

    if (this.options.ipc) {
      const { default: net } = await import("node:net");

      await /** @type {Promise<void>} */ (
        new Promise((resolve, reject) => {
          const socket = new net.Socket();

          socket.on(
            "error",
            /**
             * @param {Error & { code?: string }} error error
             */
            (error) => {
              if (error.code === "ECONNREFUSED") {
                // No other server listening on this socket, so it can be safely removed
                fs.unlinkSync(/** @type {string} */ (this.options.ipc));

                resolve();

                return;
              } else if (error.code === "ENOENT") {
                resolve();

                return;
              }

              reject(error);
            },
          );

          socket.connect(
            { path: /** @type {string} */ (this.options.ipc) },
            () => {
              throw new Error(`IPC "${this.options.ipc}" is already used`);
            },
          );
        })
      );
    } else {
      this.options.host = await Server.getHostname(
        /** @type {Host} */ (this.options.host),
      );
      this.options.port = await Server.getFreePort(
        /** @type {Port} */ (this.options.port),
        this.options.host,
      );
    }

    await this.initialize();
  }

  /**
   * @private
   * @returns {Promise<void>}
   */
  async listen() {
    const listenOptions = this.options.ipc
      ? { path: this.options.ipc }
      : { host: this.options.host, port: this.options.port };

    await /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        /** @type {S} */
        (this.server).listen(listenOptions, () => {
          resolve();
        });
      })
    );

    if (this.options.ipc) {
      // chmod 666 (rw rw rw)
      const READ_WRITE = 438;

      await fs.promises.chmod(
        /** @type {string} */ (this.options.ipc),
        READ_WRITE,
      );
    }

    if (this.options.webSocketServer) {
      await this.createWebSocketServer();
    }

    if (this.options.bonjour) {
      await this.runBonjour();
    }

    await this.logStatus();

    if (typeof this.options.onListening === "function") {
      this.options.onListening(this);
    }
  }

  /**
   * @param {((err?: Error) => void)=} callback callback
   */
  startCallback(callback = () => {}) {
    this.start()
      .then(() => callback(), callback)
      .catch(callback);
  }

  /**
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.bonjour) {
      await /** @type {Promise<void>} */ (
        new Promise((resolve) => {
          this.stopBonjour(() => {
            resolve();
          });
        })
      );
    }

    this.webSocketProxies = [];

    await Promise.all(this.staticWatchers.map((watcher) => watcher.close()));

    this.staticWatchers = [];

    if (this.webSocketServer) {
      await /** @type {Promise<void>} */ (
        new Promise((resolve) => {
          /** @type {WebSocketServerImplementation} */
          (this.webSocketServer).implementation.close(() => {
            this.webSocketServer = null;

            resolve();
          });

          for (const client of /** @type {WebSocketServerImplementation} */ (
            this.webSocketServer
          ).clients) {
            client.terminate();
          }

          /** @type {WebSocketServerImplementation} */
          (this.webSocketServer).clients = [];
        })
      );
    }

    if (this.server) {
      await /** @type {Promise<void>} */ (
        new Promise((resolve) => {
          /** @type {S} */
          (this.server).close(() => {
            this.server = undefined;
            resolve();
          });

          for (const socket of this.sockets) {
            socket.destroy();
          }

          this.sockets = [];

          // Force-close any remaining connections that aren't in `this.sockets`
          // (HTTP keep-alive idle connections from upstream clients,
          // long-poll requests, sockets that were upgraded out of `connection`
          // tracking, etc). Without this, `server.close()`'s callback can hang
          // indefinitely waiting for connections that never close on their own
          // — a problem that surfaces in test suites that rapidly start/stop
          // servers on the same port (next start hits EADDRINUSE).
          // `closeAllConnections` is available since Node.js 18.2.
          /** @type {S & { closeAllConnections?: () => void }} */
          (this.server).closeAllConnections?.();
        })
      );

      if (this.middleware) {
        // In plugin mode the middleware has no `watching` of its own to close
        // (the host's `compiler.close()` handles it).
        if (!this.isPlugin) {
          await /** @type {Promise<void>} */ (
            new Promise((resolve, reject) => {
              /** @type {import("webpack-dev-middleware").API<Request, Response>} */
              (this.middleware).close((error) => {
                if (error) {
                  reject(error);
                  return;
                }

                resolve();
              });
            })
          );
        }

        this.middleware = undefined;
      }
    }

    // We add listeners to signals when creating a new Server instance
    // So ensure they are removed to prevent EventEmitter memory leak warnings
    for (const item of this.listeners) {
      process.removeListener(item.name, item.listener);
    }
  }

  /**
   * @param {((err?: Error) => void)=} callback callback
   */
  stopCallback(callback = () => {}) {
    this.stop()
      .then(() => callback(), callback)
      .catch(callback);
  }

  /**
   * @param {Compiler | MultiCompiler} compiler compiler
   * @returns {void}
   */
  apply(compiler) {
    this.compiler = compiler;
    this.isPlugin = true;
    this.logger = this.compiler.getInfrastructureLogger(pluginName);

    /** @type {Promise<void> | undefined} */
    let setupPromise;
    let inWatchMode = false;
    let listening = false;
    let stopped = false;

    // `setup()` boots webpack-dev-middleware, which replaces the compiler's
    // `outputFileSystem` with an in-memory one. That swap has to happen before
    // the first compilation writes its assets, otherwise the first build lands
    // on the real disk — so it runs on `watchRun`, at the start of a watch run,
    // before anything is emitted. Guarded so the async `setup()` runs at most
    // once across rebuilds.
    /**
     * @returns {Promise<void>} promise
     */
    const ensureSetup = () => {
      if (!setupPromise) {
        setupPromise = this.setup();
      }
      return setupPromise;
    };

    // `watchRun` and `done` are tapped on the compiler directly — no iteration
    // over `MultiCompiler.compilers`:
    // - `watchRun` is a `MultiHook` on a `MultiCompiler`, so the tap is forwarded
    //   to every child and awaited. It stays `tapPromise` so a failing `setup()`
    //   rejects the user's `watch()` callback. It only fires in watch mode, which
    //   is how we know a one-shot `compiler.run()` build is not in play.
    // - `done` on a `MultiCompiler` is the aggregate `SyncHook` that fires once
    //   after every child finishes, so the server starts exactly once. Being a
    //   `SyncHook`, it can only be `tap`ped; `listen()` runs detached.
    const { hooks } = /** @type {Compiler} */ (compiler);

    hooks.watchRun.tapPromise(pluginName, () => {
      inWatchMode = true;
      return ensureSetup();
    });

    hooks.done.tap(pluginName, () => {
      // `done` also fires for a one-shot `compiler.run()` build, where no
      // `watchRun` ran; staying passive lets that build finish and exit.
      if (listening || !inWatchMode) return;
      listening = true;
      ensureSetup()
        .then(() => this.listen())
        .catch((error) => {
          this.logger.error(error);
        });
    });

    /**
     * @returns {Promise<void>} promise
     */
    const onShutdown = async () => {
      if (stopped) return;
      stopped = true;
      await this.stop();
    };

    // Teardown is the one place a loop is unavoidable. A `MultiCompiler` has no
    // `shutdown` hook, and its aggregate `watchClose` does NOT fire on
    // `compiler.close()` (only on `watching.close()`), so the only signal that
    // survives `compiler.close()` is each child's own `shutdown`. Tapping it
    // with `tapPromise` also lets `compiler.close()` await the server actually
    // stopping, so the port is released before the next start.
    const childCompilers = /** @type {MultiCompiler} */ (compiler)
      .compilers || [compiler];

    for (const childCompiler of childCompilers) {
      childCompiler.hooks.shutdown.tapPromise(pluginName, onShutdown);
    }
  }
}

export default Server;
