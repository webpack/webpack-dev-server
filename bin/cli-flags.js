"use strict";

module.exports = {
  "allowed-hosts": {
    configs: [
      {
        type: "string",
        multiple: true,
        description:
          "Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto').",
        path: "allowedHosts[]",
      },
      {
        description:
          "Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto').",
        multiple: false,
        path: "allowedHosts",
        type: "enum",
        values: ["auto", "all"],
      },
    ],
    description:
      "Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto').",
    multiple: true,
    simpleType: "string",
  },
  "allowed-hosts-reset": {
    configs: [
      {
        type: "reset",
        multiple: false,
        description:
          "Clear all items provided in 'allowedHosts' configuration. Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto').",
        path: "allowedHosts",
      },
    ],
    description:
      "Clear all items provided in 'allowedHosts' configuration. Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto').",
    simpleType: "boolean",
    multiple: false,
  },
  bonjour: {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description:
          "Allows to broadcasts dev server via ZeroConf networking on start.",
        path: "bonjour",
      },
    ],
    description:
      "Allows to broadcasts dev server via ZeroConf networking on start.",
    negatedDescription:
      "Disallows to broadcasts dev server via ZeroConf networking on start.",
    simpleType: "boolean",
    multiple: false,
  },
  "client-web-socket-transport": {
    configs: [
      {
        type: "enum",
        values: ["sockjs", "ws"],
        multiple: false,
        description:
          "Allows to set custom web socket transport to communicate with dev server.",
        path: "client.webSocketTransport",
      },
      {
        type: "string",
        multiple: false,
        description:
          "Allows to set custom web socket transport to communicate with dev server.",
        path: "client.webSocketTransport",
      },
    ],
    description:
      "Allows to set custom web socket transport to communicate with dev server.",
    simpleType: "string",
    multiple: false,
  },
  client: {
    configs: [
      {
        description:
          "Allows to specify options for client script in the browser or disable client script.",
        multiple: false,
        path: "client",
        type: "enum",
        values: [false],
      },
    ],
    description:
      "Allows to specify options for client script in the browser or disable client script.",
    multiple: false,
    simpleType: "boolean",
  },
  "client-logging": {
    configs: [
      {
        type: "enum",
        values: ["none", "error", "warn", "info", "log", "verbose"],
        multiple: false,
        description:
          "Allows to specify options for client script in the browser or disable client script.",
        path: "client.logging",
      },
    ],
    description:
      "Allows to specify options for client script in the browser or disable client script.",
    simpleType: "string",
    multiple: false,
  },
  "client-progress": {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description:
          "Prints compilation progress in percentage in the browser.",
        path: "client.progress",
      },
    ],
    description: "Prints compilation progress in percentage in the browser.",
    negatedDescription:
      "Does not print compilation progress in percentage in the browser.",
    simpleType: "boolean",
    multiple: false,
  },
  "client-overlay": {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description:
          "Enables a full-screen overlay in the browser when there are compiler errors or warnings.",
        path: "client.overlay",
      },
    ],
    description:
      "Enables a full-screen overlay in the browser when there are compiler errors or warnings.",
    negatedDescription:
      "Disables a full-screen overlay in the browser when there are compiler errors or warnings.",
    simpleType: "boolean",
    multiple: false,
  },
  "client-overlay-errors": {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description:
          "Enables a full-screen overlay in the browser when there are compiler errors.",
        path: "client.overlay.errors",
      },
    ],
    description:
      "Enables a full-screen overlay in the browser when there are compiler errors.",
    simpleType: "boolean",
    multiple: false,
  },
  "client-overlay-warnings": {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description:
          "Enables a full-screen overlay in the browser when there are compiler warnings.",
        path: "client.overlay.warnings",
      },
    ],
    description:
      "Enables a full-screen overlay in the browser when there are compiler warnings.",
    simpleType: "boolean",
    multiple: false,
  },
  "client-web-socket-url": {
    configs: [
      {
        type: "string",
        multiple: false,
        description:
          "Allows to specify URL to web socket server (useful when you're proxying dev server and client script does not always know where to connect to).",
        path: "client.webSocketURL",
      },
    ],
    description:
      "Allows to specify URL to web socket server (useful when you're proxying dev server and client script does not always know where to connect to).",
    simpleType: "string",
    multiple: false,
  },
  "client-web-socket-url-hostname": {
    configs: [
      {
        type: "string",
        multiple: false,
        description:
          "Tells clients connected to devServer to use the provided hostname.",
        path: "client.webSocketURL.hostname",
      },
    ],
    description:
      "Tells clients connected to devServer to use the provided hostname.",
    simpleType: "string",
    multiple: false,
  },
  "client-web-socket-url-port": {
    configs: [
      {
        type: "number",
        multiple: false,
        description:
          "Tells clients connected to devServer to use the provided port.",
        path: "client.webSocketURL.port",
      },
      {
        description:
          "Tells clients connected to devServer to use the provided port.",
        multiple: false,
        path: "client.webSocketURL.port",
        type: "string",
      },
    ],
    description:
      "Tells clients connected to devServer to use the provided port.",
    simpleType: "string",
    multiple: false,
  },
  "client-web-socket-url-pathname": {
    configs: [
      {
        type: "string",
        multiple: false,
        description:
          "Tells clients connected to devServer to use the provided path to connect.",
        path: "client.webSocketURL.pathname",
      },
    ],
    description:
      "Tells clients connected to devServer to use the provided path to connect.",
    simpleType: "string",
    multiple: false,
  },
  "client-web-socket-url-protocol": {
    configs: [
      {
        description:
          "Tells clients connected to devServer to use the provided protocol.",
        multiple: false,
        path: "client.webSocketURL.protocol",
        type: "enum",
        values: ["auto"],
      },
      {
        description:
          "Tells clients connected to devServer to use the provided protocol.",
        multiple: false,
        path: "client.webSocketURL.protocol",
        type: "string",
      },
    ],
    description:
      "Tells clients connected to devServer to use the provided protocol.",
    multiple: false,
    simpleType: "string",
  },
  "client-web-socket-url-username": {
    configs: [
      {
        type: "string",
        multiple: false,
        description:
          "Tells clients connected to devServer to use the provided username to authenticate.",
        path: "client.webSocketURL.username",
      },
    ],
    description:
      "Tells clients connected to devServer to use the provided username to authenticate.",
    simpleType: "string",
    multiple: false,
  },
  "client-web-socket-url-password": {
    configs: [
      {
        type: "string",
        multiple: false,
        description:
          "Tells clients connected to devServer to use the provided password to authenticate.",
        path: "client.webSocketURL.password",
      },
    ],
    description:
      "Tells clients connected to devServer to use the provided password to authenticate.",
    simpleType: "string",
    multiple: false,
  },
  "web-socket-server": {
    configs: [
      {
        type: "enum",
        values: [false, "sockjs", "ws"],
        multiple: false,
        description:
          "Allows to set web socket server and options (by default 'ws').",
        path: "webSocketServer",
      },
      {
        type: "string",
        multiple: false,
        description:
          "Allows to set web socket server and options (by default 'ws').",
        path: "webSocketServer",
      },
    ],
    description:
      "Allows to set web socket server and options (by default 'ws').",
    simpleType: "string",
    multiple: false,
  },
  compress: {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description: "Enables gzip compression for everything served.",
        path: "compress",
      },
    ],
    description: "Enables gzip compression for everything served.",
    negatedDescription: "Disables gzip compression for everything served.",
    simpleType: "boolean",
    multiple: false,
  },
  "history-api-fallback": {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description:
          "Allows to proxy requests through a specified index page (by default 'index.html'), useful for Single Page Applications that utilise the HTML5 History API.",
        path: "historyApiFallback",
      },
    ],
    description:
      "Allows to proxy requests through a specified index page (by default 'index.html'), useful for Single Page Applications that utilise the HTML5 History API.",
    simpleType: "boolean",
    multiple: false,
  },
  host: {
    configs: [
      {
        description: "Allows to specify a hostname to use.",
        multiple: false,
        path: "host",
        type: "enum",
        values: ["local-ip", "local-ipv4", "local-ipv6"],
      },
      {
        description: "Allows to specify a hostname to use.",
        multiple: false,
        path: "host",
        type: "string",
      },
    ],
    description: "Allows to specify a hostname to use.",
    simpleType: "string",
    multiple: false,
  },
  hot: {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description: "Enables Hot Module Replacement.",
        path: "hot",
      },
      {
        type: "enum",
        values: ["only"],
        multiple: false,
        description: "Enables Hot Module Replacement.",
        path: "hot",
      },
    ],
    description: "Enables Hot Module Replacement.",
    negatedDescription: "Disables Hot Module Replacement.",
    simpleType: "string",
    multiple: false,
  },
  http2: {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description: "Allows to serve over HTTP/2 using SPDY.",
        path: "http2",
      },
    ],
    description: "Allows to serve over HTTP/2 using SPDY.",
    negatedDescription: "Does not serve over HTTP/2 using SPDY.",
    simpleType: "boolean",
    multiple: false,
  },
  https: {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description:
          "Allows to configure the server's listening socket for TLS (by default, dev server will be served over HTTP).",
        path: "https",
      },
    ],
    description:
      "Allows to configure the server's listening socket for TLS (by default, dev server will be served over HTTP).",
    negatedDescription:
      "Disallows to configure the server's listening socket for TLS (by default, dev server will be served over HTTP).",
    simpleType: "boolean",
    multiple: false,
  },
  "https-passphrase": {
    configs: [
      {
        type: "string",
        multiple: false,
        description: "Passphrase for a pfx file.",
        path: "https.passphrase",
      },
    ],
    description: "Passphrase for a pfx file.",
    simpleType: "string",
    multiple: false,
  },
  "https-request-cert": {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description: "Request for an SSL certificate.",
        path: "https.requestCert",
      },
    ],
    description: "Request for an SSL certificate.",
    negatedDescription: "Does not request for an SSL certificate.",
    simpleType: "boolean",
    multiple: false,
  },
  "https-cacert": {
    configs: [
      {
        type: "string",
        multiple: false,
        description: "Path to an SSL CA certificate.",
        path: "https.cacert",
      },
    ],
    description: "Path to an SSL CA certificate.",
    simpleType: "string",
    multiple: false,
  },
  "https-key": {
    configs: [
      {
        type: "string",
        multiple: false,
        description: "Path to an SSL key.",
        path: "https.key",
      },
    ],
    description: "Path to an SSL key.",
    simpleType: "string",
    multiple: false,
  },
  "https-pfx": {
    configs: [
      {
        type: "string",
        multiple: false,
        description: "Path to an SSL pfx file.",
        path: "https.pfx",
      },
    ],
    description: "Path to an SSL pfx file.",
    simpleType: "string",
    multiple: false,
  },
  "https-cert": {
    configs: [
      {
        type: "string",
        multiple: false,
        description: "Path to an SSL certificate.",
        path: "https.cert",
      },
    ],
    description: "Path to an SSL certificate.",
    simpleType: "string",
    multiple: false,
  },
  ipc: {
    configs: [
      {
        type: "string",
        multiple: false,
        description: "Listen to a unix socket.",
        path: "ipc",
      },
      {
        type: "enum",
        values: [true],
        multiple: false,
        description: "Listen to a unix socket.",
        path: "ipc",
      },
    ],
    description: "Listen to a unix socket.",
    simpleType: "string",
    multiple: false,
  },
  "live-reload": {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description:
          "Enables reload/refresh the page(s) when file changes are detected (enabled by default).",
        path: "liveReload",
      },
    ],
    description:
      "Enables reload/refresh the page(s) when file changes are detected (enabled by default).",
    negatedDescription:
      "Disables reload/refresh the page(s) when file changes are detected (enabled by default)",
    simpleType: "boolean",
    multiple: false,
  },
  "magic-html": {
    configs: [
      {
        type: "boolean",
        multiple: false,
        description: "Enables/Disables magic HTML routes (enabled by default).",
        path: "magicHtml",
      },
    ],
    description: "Enables/Disables magic HTML routes (enabled by default).",
    simpleType: "boolean",
    multiple: false,
  },
  open: {
    configs: [
      {
        type: "string",
        multiple: true,
        description:
          "Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser).",
        path: "open[]",
      },
      {
        type: "boolean",
        multiple: false,
        description:
          "Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser).",
        path: "open",
      },
    ],
    description:
      "Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser).",
    negatedDescription: "Does not open the default browser.",
    simpleType: "string",
    multiple: true,
  },
  "open-target": {
    configs: [
      {
        type: "string",
        multiple: true,
        description: "Opens specified page in browser.",
        path: "open[].target",
      },
      {
        type: "string",
        multiple: true,
        description: "Opens specified page in browser.",
        path: "open.target[]",
      },
    ],
    description: "Opens specified page in browser.",
    negatedDescription: "Does not open specified page in browser.",
    simpleType: "string",
    multiple: true,
  },
  "open-app-name": {
    configs: [
      {
        type: "string",
        multiple: true,
        description: "Open specified browser.",
        path: "open[].app.name",
      },
      {
        type: "string",
        multiple: true,
        description: "Open specified browser.",
        path: "open.app.name[]",
      },
    ],
    description: "Open specified browser.",
    simpleType: "string",
    multiple: true,
  },
  "open-app": {
    configs: [
      {
        type: "string",
        multiple: true,
        description: "Open specified browser.",
        path: "open[].app",
      },
    ],
    description: "Open specified browser.",
    simpleType: "string",
    multiple: true,
  },
  "open-reset": {
    configs: [
      {
        type: "reset",
        multiple: false,
        description:
          "Clear all items provided in 'open' configuration. Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser).",
        path: "open",
      },
    ],
    description:
      "Clear all items provided in 'open' configuration. Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser).",
    simpleType: "boolean",
    multiple: false,
  },
  "open-target-reset": {
    configs: [
      {
        type: "reset",
        multiple: false,
        description:
          "Clear all items provided in 'open.target' configuration. Opens specified page in browser.",
        path: "open.target",
      },
    ],
    description:
      "Clear all items provided in 'open.target' configuration. Opens specified page in browser.",
    simpleType: "boolean",
    multiple: false,
  },
  "open-app-name-reset": {
    configs: [
      {
        type: "reset",
        multiple: false,
        description:
          "Clear all items provided in 'open.app.name' configuration. Open specified browser.",
        path: "open.app.name",
      },
    ],
    description:
      "Clear all items provided in 'open.app.name' configuration. Open specified browser.",
    simpleType: "boolean",
    multiple: false,
  },
  port: {
    configs: [
      {
        type: "number",
        multiple: false,
        description: "Allows to specify a port to use.",
        path: "port",
      },
      {
        type: "string",
        multiple: false,
        description: "Allows to specify a port to use.",
        path: "port",
      },
      {
        type: "enum",
        values: ["auto"],
        multiple: false,
        description: "Allows to specify a port to use.",
        path: "port",
      },
    ],
    description: "Allows to specify a port to use.",
    simpleType: "string",
    multiple: false,
  },
  static: {
    configs: [
      {
        type: "string",
        multiple: true,
        description:
          "Allows to configure options for serving static files from directory (by default 'public' directory).",
        path: "static[]",
      },
      {
        type: "boolean",
        multiple: false,
        description:
          "Allows to configure options for serving static files from directory (by default 'public' directory).",
        path: "static",
      },
    ],
    description:
      "Allows to configure options for serving static files from directory (by default 'public' directory).",
    simpleType: "string",
    multiple: true,
  },
  "static-directory": {
    configs: [
      {
        type: "string",
        multiple: true,
        description: "Directory for static contents.",
        path: "static[].directory",
      },
    ],
    description: "Directory for static contents.",
    simpleType: "string",
    multiple: true,
  },
  "static-public-path": {
    configs: [
      {
        type: "string",
        multiple: true,
        description:
          "The static files will be available in the browser under this public path.",
        path: "static[].publicPath",
      },
      {
        type: "string",
        multiple: true,
        description:
          "The static files will be available in the browser under this public path.",
        path: "static.publicPath[]",
      },
    ],
    description:
      "The static files will be available in the browser under this public path.",
    simpleType: "string",
    multiple: true,
  },
  "static-serve-index": {
    configs: [
      {
        type: "boolean",
        multiple: true,
        description:
          "Tells dev server to use serveIndex middleware when enabled.",
        path: "static[].serveIndex",
      },
    ],
    description: "Tells dev server to use serveIndex middleware when enabled.",
    negatedDescription:
      "Does not tell dev server to use serveIndex middleware.",
    simpleType: "boolean",
    multiple: true,
  },
  "static-watch": {
    configs: [
      {
        type: "boolean",
        multiple: true,
        description: "Watches for files in static content directory.",
        path: "static[].watch",
      },
    ],
    description: "Watches for files in static content directory.",
    negatedDescription: "Does not watch for files in static content directory.",
    simpleType: "boolean",
    multiple: true,
  },
  "static-reset": {
    configs: [
      {
        type: "reset",
        multiple: false,
        description:
          "Clear all items provided in 'static' configuration. Allows to configure options for serving static files from directory (by default 'public' directory).",
        path: "static",
      },
    ],
    description:
      "Clear all items provided in 'static' configuration. Allows to configure options for serving static files from directory (by default 'public' directory).",
    simpleType: "boolean",
    multiple: false,
  },
  "static-public-path-reset": {
    configs: [
      {
        type: "reset",
        multiple: false,
        description:
          "Clear all items provided in 'static.publicPath' configuration. The static files will be available in the browser under this public path.",
        path: "static.publicPath",
      },
    ],
    description:
      "Clear all items provided in 'static.publicPath' configuration. The static files will be available in the browser under this public path.",
    simpleType: "boolean",
    multiple: false,
  },
  "watch-files": {
    configs: [
      {
        type: "string",
        multiple: true,
        description:
          "Allows to configure list of globs/directories/files to watch for file changes.",
        path: "watchFiles[]",
      },
    ],
    description:
      "Allows to configure list of globs/directories/files to watch for file changes.",
    simpleType: "string",
    multiple: true,
  },
  "watch-files-reset": {
    configs: [
      {
        type: "reset",
        multiple: false,
        description:
          "Clear all items provided in 'watchFiles' configuration. Allows to configure list of globs/directories/files to watch for file changes.",
        path: "watchFiles",
      },
    ],
    description:
      "Clear all items provided in 'watchFiles' configuration. Allows to configure list of globs/directories/files to watch for file changes.",
    simpleType: "boolean",
    multiple: false,
  },
};
