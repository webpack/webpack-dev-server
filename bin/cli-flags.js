'use strict';

module.exports = {
  'allowed-hosts': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description:
          "Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto'). https://webpack.js.org/configuration/dev-server/#devserverallowedhosts",
        path: 'allowedHosts[]',
      },
      {
        description:
          "Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto'). https://webpack.js.org/configuration/dev-server/#devserverallowedhosts",
        multiple: false,
        path: 'allowedHosts',
        type: 'enum',
        values: ['auto', 'all'],
      },
    ],
    description:
      "Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto'). https://webpack.js.org/configuration/dev-server/#devserverallowedhosts",
    multiple: true,
    simpleType: 'string',
  },
  'allowed-hosts-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          "Clear all items provided in configuration. Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto'). https://webpack.js.org/configuration/dev-server/#devserverallowedhosts",
        path: 'allowedHosts',
      },
    ],
    description:
      "Clear all items provided in configuration. Allows to enumerate the hosts from which access to the dev server are allowed (useful when you are proxying dev server, by default is 'auto'). https://webpack.js.org/configuration/dev-server/#devserverallowedhosts",
    simpleType: 'boolean',
    multiple: false,
  },
  bonjour: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Allows to broadcasts dev server via ZeroConf networking on start. https://webpack.js.org/configuration/dev-server/#devserverbonjour',
        path: 'bonjour',
      },
    ],
    description:
      'Allows to broadcasts dev server via ZeroConf networking on start. https://webpack.js.org/configuration/dev-server/#devserverbonjour',
    negatedDescription:
      'Disallows to broadcasts dev server via ZeroConf networking on start. https://webpack.js.org/configuration/dev-server/#devserverbonjour',
    simpleType: 'boolean',
    multiple: false,
  },
  'client-transport': {
    configs: [
      {
        type: 'enum',
        values: ['sockjs', 'ws'],
        multiple: false,
        description:
          'Allows to set custom transport to communicate with dev server.',
        path: 'client.transport',
      },
      {
        type: 'string',
        multiple: false,
        description:
          'Allows to set custom transport to communicate with dev server.',
        path: 'client.transport',
      },
    ],
    description:
      'Allows to set custom transport to communicate with dev server.',
    simpleType: 'string',
    multiple: false,
  },
  'client-logging': {
    configs: [
      {
        type: 'enum',
        values: ['none', 'error', 'warn', 'info', 'log', 'verbose'],
        multiple: false,
        description:
          'Allows to specify options for client script in the browser. https://webpack.js.org/configuration/dev-server/#devserverclient',
        path: 'client.logging',
      },
    ],
    description:
      'Allows to specify options for client script in the browser. https://webpack.js.org/configuration/dev-server/#devserverclient',
    simpleType: 'string',
    multiple: false,
  },
  'client-progress': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Prints compilation progress in percentage in the browser.',
        path: 'client.progress',
      },
    ],
    description: 'Prints compilation progress in percentage in the browser.',
    negatedDescription:
      'Does not print compilation progress in percentage in the browser.',
    simpleType: 'boolean',
    multiple: false,
  },
  'client-overlay': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Enables a full-screen overlay in the browser when there are compiler errors or warnings.',
        path: 'client.overlay',
      },
    ],
    description:
      'Enables a full-screen overlay in the browser when there are compiler errors or warnings.',
    negatedDescription:
      'Disables a full-screen overlay in the browser when there are compiler errors or warnings.',
    simpleType: 'boolean',
    multiple: false,
  },
  'client-overlay-errors': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Enables a full-screen overlay in the browser when there are compiler errors.',
        path: 'client.overlay.errors',
      },
    ],
    description:
      'Enables a full-screen overlay in the browser when there are compiler errors.',
    simpleType: 'boolean',
    multiple: false,
  },
  'client-overlay-warnings': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Enables a full-screen overlay in the browser when there are compiler warnings.',
        path: 'client.overlay.warnings',
      },
    ],
    description:
      'Enables a full-screen overlay in the browser when there are compiler warnings.',
    simpleType: 'boolean',
    multiple: false,
  },
  'client-need-client-entry': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: 'Inject a client entry.',
        path: 'client.needClientEntry',
      },
    ],
    description: 'Inject a client entry.',
    simpleType: 'boolean',
    multiple: false,
  },
  'client-hot-entry': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: 'Injects a Hot Module Replacement entry.',
        path: 'client.hotEntry',
      },
    ],
    description: 'Injects a Hot Module Replacement entry.',
    negatedDescription: 'Does not injects a Hot Module Replacement entry.',
    simpleType: 'boolean',
    multiple: false,
  },
  'client-web-socket-url': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description:
          "Allows to specify URL to web socket server (useful when you're proxying dev server and client script does not always know where to connect to).",
        path: 'client.webSocketURL',
      },
    ],
    description:
      "Allows to specify URL to web socket server (useful when you're proxying dev server and client script does not always know where to connect to).",
    simpleType: 'string',
    multiple: false,
  },
  'client-web-socket-url-host': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description:
          'Tells clients connected to devServer to use the provided host.',
        path: 'client.webSocketURL.host',
      },
    ],
    description:
      'Tells clients connected to devServer to use the provided host.',
    simpleType: 'string',
    multiple: false,
  },
  'client-web-socket-url-port': {
    configs: [
      {
        type: 'number',
        multiple: false,
        description:
          'Tells clients connected to devServer to use the provided port.',
        path: 'client.webSocketURL.port',
      },
      {
        description:
          'Tells clients connected to devServer to use the provided port.',
        multiple: false,
        path: 'client.webSocketURL.port',
        type: 'string',
      },
    ],
    description:
      'Tells clients connected to devServer to use the provided port.',
    simpleType: 'string',
    multiple: false,
  },
  'client-web-socket-url-path': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description:
          'Tells clients connected to devServer to use the provided path to connect.',
        path: 'client.webSocketURL.path',
      },
    ],
    description:
      'Tells clients connected to devServer to use the provided path to connect.',
    simpleType: 'string',
    multiple: false,
  },
  'client-web-socket-url-protocol': {
    configs: [
      {
        description:
          'Tells clients connected to devServer to use the provided protocol.',
        multiple: false,
        path: 'client.webSocketURL.protocol',
        type: 'enum',
        values: ['auto'],
      },
      {
        description:
          'Tells clients connected to devServer to use the provided protocol.',
        multiple: false,
        path: 'client.webSocketURL.protocol',
        type: 'string',
      },
    ],
    description:
      'Tells clients connected to devServer to use the provided protocol.',
    multiple: false,
    simpleType: 'string',
  },
  'web-socket-server': {
    configs: [
      {
        type: 'enum',
        values: ['sockjs', 'ws'],
        multiple: false,
        description:
          "Allows to set web socket server and options (by default 'ws'). https://webpack.js.org/configuration/dev-server/#devserverwebsocketserver",
        path: 'webSocketServer',
      },
      {
        type: 'string',
        multiple: false,
        description:
          "Allows to set web socket server and options (by default 'ws'). https://webpack.js.org/configuration/dev-server/#devserverwebsocketserver",
        path: 'webSocketServer',
      },
    ],
    description:
      "Allows to set web socket server and options (by default 'ws'). https://webpack.js.org/configuration/dev-server/#devserverwebsocketserver",
    simpleType: 'string',
    multiple: false,
  },
  compress: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Enables gzip compression for everything served. https://webpack.js.org/configuration/dev-server/#devservercompress',
        path: 'compress',
      },
    ],
    description:
      'Enables gzip compression for everything served. https://webpack.js.org/configuration/dev-server/#devservercompress',
    negatedDescription: 'Disables gzip compression for everything served.',
    simpleType: 'boolean',
    multiple: false,
  },
  'history-api-fallback': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          "Allows to proxy requests through a specified index page (by default 'index.html'), useful for Single Page Applications that utilise the HTML5 History API. https://webpack.js.org/configuration/dev-server/#devserverhistoryapifallback",
        path: 'historyApiFallback',
      },
    ],
    description:
      "Allows to proxy requests through a specified index page (by default 'index.html'), useful for Single Page Applications that utilise the HTML5 History API. https://webpack.js.org/configuration/dev-server/#devserverhistoryapifallback",
    simpleType: 'boolean',
    multiple: false,
  },
  host: {
    configs: [
      {
        type: 'string',
        multiple: false,
        description:
          'Allows to specify a hostname to use. https://webpack.js.org/configuration/dev-server/#devserverhost',
        path: 'host',
      },
    ],
    description:
      'Allows to specify a hostname to use. https://webpack.js.org/configuration/dev-server/#devserverhost',
    simpleType: 'string',
    multiple: false,
  },
  hot: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Enables Hot Module Replacement. https://webpack.js.org/configuration/dev-server/#devserverhot',
        path: 'hot',
      },
      {
        type: 'enum',
        values: ['only'],
        multiple: false,
        description:
          'Enables Hot Module Replacement. https://webpack.js.org/configuration/dev-server/#devserverhot',
        path: 'hot',
      },
    ],
    description:
      'Enables Hot Module Replacement. https://webpack.js.org/configuration/dev-server/#devserverhot',
    negatedDescription: 'Disables Hot Module Replacement.',
    simpleType: 'string',
    multiple: false,
  },
  http2: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Allows to serve over HTTP/2 using SPDY. https://webpack.js.org/configuration/dev-server/#devserverhttp2',
        path: 'http2',
      },
    ],
    description:
      'Allows to serve over HTTP/2 using SPDY. https://webpack.js.org/configuration/dev-server/#devserverhttp2',
    negatedDescription: 'Does not serve over HTTP/2 using SPDY.',
    simpleType: 'boolean',
    multiple: false,
  },
  https: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          "Allows to configure the server's listening socket for TLS (by default, dev server will be served over HTTP). https://webpack.js.org/configuration/dev-server/#devserverhttps",
        path: 'https',
      },
    ],
    description:
      "Allows to configure the server's listening socket for TLS (by default, dev server will be served over HTTP). https://webpack.js.org/configuration/dev-server/#devserverhttps",
    negatedDescription:
      "Disallows to configure the server's listening socket for TLS (by default, dev server will be served over HTTP).",
    simpleType: 'boolean',
    multiple: false,
  },
  'https-passphrase': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description: 'Passphrase for a pfx file.',
        path: 'https.passphrase',
      },
    ],
    description: 'Passphrase for a pfx file.',
    simpleType: 'string',
    multiple: false,
  },
  'https-request-cert': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: 'Request for an SSL certificate.',
        path: 'https.requestCert',
      },
    ],
    description: 'Request for an SSL certificate.',
    negatedDescription: 'Does not request for an SSL certificate.',
    simpleType: 'boolean',
    multiple: false,
  },
  'https-cacert': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description: 'Path to an SSL CA certificate.',
        path: 'https.cacert',
      },
    ],
    description: 'Path to an SSL CA certificate.',
    simpleType: 'string',
    multiple: false,
  },
  'https-key': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description: 'Path to an SSL key.',
        path: 'https.key',
      },
    ],
    description: 'Path to an SSL key.',
    simpleType: 'string',
    multiple: false,
  },
  'https-pfx': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description: 'Path to an SSL pfx file.',
        path: 'https.pfx',
      },
    ],
    description: 'Path to an SSL pfx file.',
    simpleType: 'string',
    multiple: false,
  },
  'https-cert': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description: 'Path to an SSL certificate.',
        path: 'https.cert',
      },
    ],
    description: 'Path to an SSL certificate.',
    simpleType: 'string',
    multiple: false,
  },
  'live-reload': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Enables reload/refresh the page(s) when file changes are detected (enabled by default). https://webpack.js.org/configuration/dev-server/#devserverlivereload',
        path: 'liveReload',
      },
    ],
    description:
      'Enables reload/refresh the page(s) when file changes are detected (enabled by default). https://webpack.js.org/configuration/dev-server/#devserverlivereload',
    negatedDescription:
      'Disables reload/refresh the page(s) when file changes are detected (enabled by default)',
    simpleType: 'boolean',
    multiple: false,
  },
  open: {
    configs: [
      {
        type: 'string',
        multiple: true,
        description:
          'Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser). https://webpack.js.org/configuration/dev-server/#devserveropen',
        path: 'open[]',
      },
      {
        type: 'boolean',
        multiple: false,
        description:
          'Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser). https://webpack.js.org/configuration/dev-server/#devserveropen',
        path: 'open',
      },
    ],
    description:
      'Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser). https://webpack.js.org/configuration/dev-server/#devserveropen',
    negatedDescription: 'Does not open the default browser.',
    simpleType: 'string',
    multiple: true,
  },
  'open-target': {
    configs: [
      {
        type: 'boolean',
        multiple: true,
        description: 'Opens specified page in browser.',
        path: 'open[].target',
      },
      {
        type: 'string',
        multiple: true,
        description: 'Opens specified page in browser.',
        path: 'open[].target',
      },
      {
        type: 'string',
        multiple: true,
        description: 'Opens specified page in browser.',
        path: 'open.target[]',
      },
    ],
    description: 'Opens specified page in browser.',
    negatedDescription: 'Does not open specified page in browser.',
    simpleType: 'string',
    multiple: true,
  },
  'open-app-name': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description: 'Open specified browser.',
        path: 'open[].app.name',
      },
      {
        type: 'string',
        multiple: true,
        description: 'Open specified browser.',
        path: 'open.app.name[]',
      },
    ],
    description: 'Open specified browser.',
    simpleType: 'string',
    multiple: true,
  },
  'open-app': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description: 'Open specified browser.',
        path: 'open[].app',
      },
    ],
    description: 'Open specified browser.',
    simpleType: 'string',
    multiple: true,
  },
  'open-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          'Clear all items provided in configuration. Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser). https://webpack.js.org/configuration/dev-server/#devserveropen',
        path: 'open',
      },
    ],
    description:
      'Clear all items provided in configuration. Allows to configure dev server to open the browser(s) and page(s) after server had been started (set it to true to open your default browser). https://webpack.js.org/configuration/dev-server/#devserveropen',
    simpleType: 'boolean',
    multiple: false,
  },
  'open-target-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          'Clear all items provided in configuration. Opens specified page in browser.',
        path: 'open.target',
      },
    ],
    description:
      'Clear all items provided in configuration. Opens specified page in browser.',
    simpleType: 'boolean',
    multiple: false,
  },
  'open-app-name-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          'Clear all items provided in configuration. Open specified browser.',
        path: 'open.app.name',
      },
    ],
    description:
      'Clear all items provided in configuration. Open specified browser.',
    simpleType: 'boolean',
    multiple: false,
  },
  port: {
    configs: [
      {
        type: 'number',
        multiple: false,
        description:
          'Allows to specify a port to use. https://webpack.js.org/configuration/dev-server/#devserverport',
        path: 'port',
      },
      {
        type: 'string',
        multiple: false,
        description:
          'Allows to specify a port to use. https://webpack.js.org/configuration/dev-server/#devserverport',
        path: 'port',
      },
      {
        type: 'enum',
        values: ['auto'],
        multiple: false,
        description:
          'Allows to specify a port to use. https://webpack.js.org/configuration/dev-server/#devserverport',
        path: 'port',
      },
    ],
    description:
      'Allows to specify a port to use. https://webpack.js.org/configuration/dev-server/#devserverport',
    simpleType: 'string',
    multiple: false,
  },
  static: {
    configs: [
      {
        type: 'string',
        multiple: true,
        description:
          "Allows to configure options for serving static files from directory (by default 'public' directory). https://webpack.js.org/configuration/dev-server/#devserverstatic",
        path: 'static[]',
      },
      {
        type: 'boolean',
        multiple: false,
        description:
          "Allows to configure options for serving static files from directory (by default 'public' directory). https://webpack.js.org/configuration/dev-server/#devserverstatic",
        path: 'static',
      },
    ],
    description:
      "Allows to configure options for serving static files from directory (by default 'public' directory). https://webpack.js.org/configuration/dev-server/#devserverstatic",
    simpleType: 'string',
    multiple: true,
  },
  'static-directory': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description: 'Directory for static contents.',
        path: 'static[].directory',
      },
    ],
    description: 'Directory for static contents.',
    simpleType: 'string',
    multiple: true,
  },
  'static-public-path': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description:
          'The static files will be available in the browser under this public path.',
        path: 'static[].publicPath',
      },
      {
        type: 'string',
        multiple: true,
        description:
          'The static files will be available in the browser under this public path.',
        path: 'static.publicPath[]',
      },
    ],
    description:
      'The static files will be available in the browser under this public path.',
    simpleType: 'string',
    multiple: true,
  },
  'static-serve-index': {
    configs: [
      {
        type: 'boolean',
        multiple: true,
        description:
          'Tells dev server to use serveIndex middleware when enabled.',
        path: 'static[].serveIndex',
      },
    ],
    description: 'Tells dev server to use serveIndex middleware when enabled.',
    negatedDescription:
      'Does not tell dev server to use serveIndex middleware.',
    simpleType: 'boolean',
    multiple: true,
  },
  'static-watch': {
    configs: [
      {
        type: 'boolean',
        multiple: true,
        description: 'Watches for files in static content directory.',
        path: 'static[].watch',
      },
    ],
    description: 'Watches for files in static content directory.',
    negatedDescription: 'Does not watch for files in static content directory.',
    simpleType: 'boolean',
    multiple: true,
  },
  'static-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          "Clear all items provided in configuration. Allows to configure options for serving static files from directory (by default 'public' directory). https://webpack.js.org/configuration/dev-server/#devserverstatic",
        path: 'static',
      },
    ],
    description:
      "Clear all items provided in configuration. Allows to configure options for serving static files from directory (by default 'public' directory). https://webpack.js.org/configuration/dev-server/#devserverstatic",
    simpleType: 'boolean',
    multiple: false,
  },
  'static-public-path-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          'Clear all items provided in configuration. The static files will be available in the browser under this public path.',
        path: 'static.publicPath',
      },
    ],
    description:
      'Clear all items provided in configuration. The static files will be available in the browser under this public path.',
    simpleType: 'boolean',
    multiple: false,
  },
  'watch-files': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description:
          'Allows to configure list of globs/directories/files to watch for file changes. https://webpack.js.org/configuration/dev-server/#devserverwatchfiles',
        path: 'watchFiles[]',
      },
    ],
    description:
      'Allows to configure list of globs/directories/files to watch for file changes. https://webpack.js.org/configuration/dev-server/#devserverwatchfiles',
    simpleType: 'string',
    multiple: true,
  },
  'watch-files-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          'Clear all items provided in configuration. Allows to configure list of globs/directories/files to watch for file changes. https://webpack.js.org/configuration/dev-server/#devserverwatchfiles',
        path: 'watchFiles',
      },
    ],
    description:
      'Clear all items provided in configuration. Allows to configure list of globs/directories/files to watch for file changes. https://webpack.js.org/configuration/dev-server/#devserverwatchfiles',
    simpleType: 'boolean',
    multiple: false,
  },
};
