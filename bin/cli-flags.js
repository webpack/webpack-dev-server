'use strict';

const normalizeOption = (option) =>
  typeof option === 'object' && !Array.isArray(option) ? option : {};

module.exports = {
  'allowed-hosts': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description: 'Set hosts that are allowed to access the dev server.',
        path: 'allowedHosts[]',
      },
    ],
    description: 'Set hosts that are allowed to access the dev server.',
    multiple: true,
  },
  'allowed-hosts-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description: 'Clear all items provided in allowedHosts configuration.',
        path: 'firewall',
      },
    ],
    description: 'Clear all items provided in allowedHosts configuration.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.allowedHosts = opts.allowedHosts || [];
      delete opts.sllowedHostsReset;
    },
  },
  bonjour: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: 'Broadcasts the server via ZeroConf networking on start.',
        path: 'bonjour',
      },
    ],
    description: 'Broadcasts the server via ZeroConf networking on start.',
    negatedDescription:
      'Do not broadcast the server via ZeroConf networking on start.',
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
          'Allows to set custom transport to communicate with server.',
        path: 'client.transport',
      },
      {
        type: 'string',
        multiple: false,
        description:
          'Allows to set custom transport to communicate with server.',
        path: 'client.transport',
      },
    ],
    description: 'Allows to set custom transport to communicate with server.',
    simpleType: 'string',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.transport = opts.clientTransport;
      delete opts.clientTransport;
    },
  },
  'client-logging': {
    configs: [
      {
        type: 'enum',
        values: ['none', 'error', 'warn', 'info', 'log', 'verbose'],
        multiple: false,
        description: 'Specifies client properties.',
        path: 'client.logging',
      },
    ],
    description: 'Specifies client properties.',
    simpleType: 'string',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.logging = opts.clientLogging;
      delete opts.clientLogging;
    },
  },
  'client-progress': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: 'Print compilation progress in percentage in the browser.',
        path: 'client.progress',
      },
    ],
    description: 'Print compilation progress in percentage in the browser.',
    negatedDescription:
      'Do not print compilation progress in percentage in the browser.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.progress = opts.clientProgress;
      delete opts.clientProgress;
    },
  },
  'client-overlay': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Show a full-screen overlay in the browser when there are compiler errors or warnings.',
        path: 'client.overlay',
      },
    ],
    description:
      'Show a full-screen overlay in the browser when there are compiler errors or warnings.',
    negatedDescription:
      'Do not show a full-screen overlay in the browser when there are compiler errors or warnings.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.overlay = opts.clientOverlay;
      delete opts.clientOverlay;
    },
  },
  'client-overlay-errors': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Show a full-screen overlay in the browser when there are compiler errors.',
        path: 'client.overlay.errors',
      },
    ],
    description:
      'Show a full-screen overlay in the browser when there are compiler errors.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.overlay = normalizeOption(opts.client.overlay);
      opts.client.overlay.errors = opts.clientOverlayErrors;
      delete opts.clientOverlayErrors;
    },
  },
  'client-overlay-warnings': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Show a full-screen overlay in the browser when there are compiler warnings.',
        path: 'client.overlay.warnings',
      },
    ],
    description:
      'Show a full-screen overlay in the browser when there are compiler warnings.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.overlay = normalizeOption(opts.client.overlay);
      opts.client.overlay.warnings = opts.clientOverlayWarnings;
      delete opts.clientOverlayWarnings;
    },
  },
  'client-need-client-entry': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: 'Tells devServer to inject a client entry.',
        path: 'client.needClientEntry',
      },
    ],
    description: 'Tells devServer to inject a client entry.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.needClientEntry = opts.clientNeedClientEntry;
      delete opts.clientNeedClientEntry;
    },
  },
  'client-hot-entry': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'Tells devServer to inject a Hot Module Replacement entry.',
        path: 'client.hotEntry',
      },
    ],
    description: 'Tells devServer to inject a Hot Module Replacement entry.',
    negatedDescription:
      'Do not tell devServer to inject a Hot Module Replacement entry.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.hotEntry = opts.clientHotEntry;
      delete opts.clientHotEntry;
    },
  },
  'client-web-socket-url': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description:
          "When using dev server and you're proxying dev-server, the client script does not always know where to connect to.",
        path: 'client.webSocketURL',
      },
    ],
    description:
      "When using dev server and you're proxying dev-server, the client script does not always know where to connect to.",
    simpleType: 'string',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.webSocketURL = opts.clientWebSocketUrl;
      delete opts.clientWebSocketUrl;
    },
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
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.webSocketURL = normalizeOption(opts.client.webSocketURL);
      opts.client.webSocketURL.host = opts.clientWebSocketUrlHost;
      delete opts.clientWebSocketUrlHost;
    },
  },
  'client-web-socket-url-port': {
    configs: [
      {
        type: 'number',
        multiple: false,
        description:
          'Tells clients connected to devServer to use the provided port.',
        path: 'client.port',
      },
    ],
    description:
      'Tells clients connected to devServer to use the provided port.',
    simpleType: 'string',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.webSocketURL = normalizeOption(opts.client.webSocketURL);
      opts.client.webSocketURL.port = opts.clientWebSocketUrlPort;
      delete opts.clientWebSocketUrlPort;
    },
  },
  'client-web-socket-url-path': {
    configs: [
      {
        type: 'string',
        multiple: false,
        description:
          'Tells clients connected to devServer to use the provided path to connect.',
        path: 'client.path',
      },
    ],
    description:
      'Tells clients connected to devServer to use the provided path to connect.',
    simpleType: 'string',
    multiple: false,
    processor(opts) {
      opts.client = normalizeOption(opts.client);
      opts.client.webSocketURL = normalizeOption(opts.client.webSocketURL);
      opts.client.webSocketURL.path = opts.clientWebSocketUrlPath;
      delete opts.clientWebSocketUrlPath;
    },
  },
  'web-socket-server': {
    configs: [
      {
        type: 'enum',
        values: ['sockjs', 'ws'],
        multiple: false,
        description: 'Allows to set web socket server and options.',
        path: 'webSocketServer',
      },
      {
        type: 'string',
        multiple: false,
        description: 'Allows to set web socket server and options.',
        path: 'webSocketServer',
      },
    ],
    description: 'Allows to set web socket server and options.',
    simpleType: 'string',
    multiple: false,
  },
  'web-socket-server-type': {
    configs: [
      {
        type: 'enum',
        values: ['sockjs', 'ws'],
        multiple: false,
        description: 'Allows to set web socket server and options.',
        path: 'webSocketServer.type',
      },
      {
        type: 'string',
        multiple: false,
        description: 'Allows to set web socket server and options.',
        path: 'webSocketServer.type',
      },
    ],
    description: 'Allows to set web socket server and options.',
    simpleType: 'string',
    multiple: false,
    processor(opts) {
      opts.webSocketServer = normalizeOption(opts.webSocketServer);
      opts.webSocketServer.type = opts.webSocketServerType;
      delete opts.webSocketServerType;
    },
  },
  compress: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: 'Enable gzip compression for everything served.',
        path: 'compress',
      },
    ],
    description: 'Enable gzip compression for everything served.',
    negatedDescription: 'Disable gzip compression.',
    simpleType: 'boolean',
    multiple: false,
  },
  'history-api-fallback': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'When using the HTML5 History API, the index.html page will likely have to be served in place of any 404 responses.',
        path: 'historyApiFallback',
      },
    ],
    description:
      'When using the HTML5 History API, the index.html page will likely have to be served in place of any 404 responses.',
    simpleType: 'boolean',
    multiple: false,
  },
  host: {
    configs: [
      {
        type: 'string',
        multiple: false,
        description:
          'Specify a host to use. If you want your server to be accessible externally.',
        path: 'host',
      },
    ],
    description:
      'Specify a host to use. If you want your server to be accessible externally.',
    simpleType: 'string',
    multiple: false,
  },
  hot: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: "Enable webpack's Hot Module Replacement feature.",
        path: 'hot',
      },
      {
        type: 'enum',
        values: ['only'],
        multiple: false,
        description: "Enable webpack's Hot Module Replacement feature.",
        path: 'hot',
      },
    ],
    description: "Enable webpack's Hot Module Replacement feature.",
    negatedDescription: "Disable webpack's Hot Module Replacement feature.",
    simpleType: 'string',
    multiple: false,
  },
  http2: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description: 'Serve over HTTP/2 using spdy.',
        path: 'http2',
      },
    ],
    description: 'Serve over HTTP/2 using spdy.',
    negatedDescription: 'Do not use HTTP/2.',
    simpleType: 'boolean',
    multiple: false,
  },
  https: {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'By default, dev-server will be served over HTTP. It can optionally be served over HTTP/2 with HTTPS.',
        path: 'https',
      },
    ],
    description:
      'By default, dev-server will be served over HTTP. It can optionally be served over HTTP/2 with HTTPS.',
    negatedDescription: 'Do not use HTTPS protocol.',
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
    processor(opts) {
      opts.https = normalizeOption(opts.https);
      opts.https.passphrase = opts.httpsPassphrase;
      delete opts.httpsPassphrase;
    },
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
    negatedDescription: 'Do not request for an SSL certificate.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.https = normalizeOption(opts.https);
      opts.https.requestCert = opts.httpsRequestCert;
      delete opts.httpsRequestCert;
    },
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
    processor(opts) {
      opts.https = normalizeOption(opts.https);
      opts.https.cacert = opts.httpsCacert;
      delete opts.httpsCacert;
    },
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
    processor(opts) {
      opts.https = normalizeOption(opts.https);
      opts.https.key = opts.httpsKey;
      delete opts.httpsKey;
    },
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
    processor(opts) {
      opts.https = normalizeOption(opts.https);
      opts.https.pfx = opts.httpsPfx;
      delete opts.httpsPfx;
    },
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
    processor(opts) {
      opts.https = normalizeOption(opts.https);
      opts.https.cert = opts.httpsCert;
      delete opts.httpsCert;
    },
  },
  'live-reload': {
    configs: [
      {
        type: 'boolean',
        multiple: false,
        description:
          'By default, the dev-server will reload/refresh the page when file changes are detected.',
        path: 'liveReload',
      },
    ],
    description:
      'By default, the dev-server will reload/refresh the page when file changes are detected.',
    negatedDescription: 'Disables live reloading on changing files.',
    simpleType: 'boolean',
    multiple: false,
  },
  open: {
    configs: [
      {
        type: 'string',
        multiple: true,
        description:
          'Tells dev-server to open the browser after server had been started. Set it to true to open your default browser.',
        path: 'open[]',
      },
      {
        type: 'boolean',
        multiple: false,
        description:
          'Tells dev-server to open the browser after server had been started. Set it to true to open your default browser.',
        path: 'open',
      },
    ],
    description:
      'Tells dev-server to open the browser after server had been started. Set it to true to open your default browser.',
    negatedDescription: 'Do not open the default browser.',
    simpleType: 'string',
    multiple: true,
  },
  'open-target': {
    configs: [
      {
        type: 'boolean',
        multiple: true,
        description: 'Open specified route in browser.',
        path: 'open[].target',
      },
      {
        type: 'string',
        multiple: true,
        description: 'Open specified route in browser.',
        path: 'open[].target',
      },
      {
        type: 'string',
        multiple: true,
        description: 'Open specified route in browser.',
        path: 'open.target[]',
      },
    ],
    description: 'Open specified route in browser.',
    negatedDescription: 'Do not open specified route in browser.',
    simpleType: 'string',
    multiple: true,
    processor(opts) {
      opts.open = normalizeOption(opts.open);
      opts.open.target = opts.openTarget;
      delete opts.openTarget;
    },
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
    processor(opts) {
      opts.open = normalizeOption(opts.open);
      opts.open.app = normalizeOption(opts.open.app);
      opts.open.app.name = opts.openAppName;
      delete opts.openAppName;
    },
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
    multiple: false,
    processor(opts) {
      opts.open = normalizeOption(opts.open);
      opts.open.app = opts.openApp;
      delete opts.openApp;
    },
  },
  'open-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description: 'Clear all items provided in open configuration.',
        path: 'open',
      },
    ],
    description: 'Clear all items provided in open configuration.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.open = opts.open || [];
      delete opts.openReset;
    },
  },
  'open-target-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description: 'Clear all items provided in open.target configuration.',
        path: 'open.target',
      },
    ],
    description: 'Clear all items provided in open.target configuration.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.open = normalizeOption(opts.open);
      opts.open.target = opts.openTarget || [];
      delete opts.openTargetReset;
    },
  },
  'open-app-name-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description: 'Clear all items provided in open.app.name configuration.',
        path: 'open.app.name',
      },
    ],
    description: 'Clear all items provided in open.app.name configuration.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.open = normalizeOption(opts.open);
      opts.open.app = normalizeOption(opts.open.app);
      opts.open.app.name = opts.openAppName || [];
      delete opts.openAppNameReset;
    },
  },
  port: {
    configs: [
      {
        type: 'number',
        multiple: false,
        description: 'Specify a port number to listen for requests on.',
        path: 'port',
      },
      {
        type: 'string',
        multiple: false,
        description: 'Specify a port number to listen for requests on.',
        path: 'port',
      },
      {
        type: 'enum',
        values: ['auto'],
        multiple: false,
        description: 'Specify a port number to listen for requests on.',
        path: 'port',
      },
    ],
    description: 'Specify a port number to listen for requests on.',
    simpleType: 'string',
    multiple: false,
  },
  public: {
    configs: [
      {
        type: 'string',
        multiple: false,
        description:
          'The public hostname/ip address of the server that client script will try to connect to.',
        path: 'public',
      },
    ],
    description:
      'The public hostname/ip address of the server that client script will try to connect to.',
    simpleType: 'string',
    multiple: false,
  },
  static: {
    configs: [
      {
        type: 'string',
        multiple: true,
        description:
          'It is possible to configure advanced options for serving static files from directory. See the Express documentation for the possible options.',
        path: 'static[]',
      },
      {
        type: 'boolean',
        multiple: false,
        description:
          'It is possible to configure advanced options for serving static files from directory. See the Express documentation for the possible options.',
        path: 'static',
      },
    ],
    description:
      'It is possible to configure advanced options for serving static files from directory. See the Express documentation for the possible options.',
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
    multiple: false,
    processor(opts) {
      opts.static = normalizeOption(opts.static);
      opts.static.directory = opts.staticDirectory;
      delete opts.staticDirectory;
    },
  },
  'static-public-path': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description:
          'The bundled files will be available in the browser under this path.',
        path: 'static[].publicPath',
      },
      {
        type: 'string',
        multiple: true,
        description:
          'The bundled files will be available in the browser under this path.',
        path: 'static.publicPath[]',
      },
    ],
    description:
      'The bundled files will be available in the browser under this path.',
    simpleType: 'string',
    multiple: true,
    processor(opts) {
      opts.static = normalizeOption(opts.static);
      opts.static.publicPath = opts.staticPublicPath;
      delete opts.staticPublicPath;
    },
  },
  'static-serve-index': {
    configs: [
      {
        type: 'boolean',
        multiple: true,
        description:
          'Tells dev-server to use serveIndex middleware when enabled.',
        path: 'static[].serveIndex',
      },
    ],
    description: 'Tells dev-server to use serveIndex middleware when enabled.',
    negatedDescription: 'Do not tell dev-server to use serveIndex middleware.',
    simpleType: 'boolean',
    multiple: true,
    processor(opts) {
      opts.static = normalizeOption(opts.static);
      opts.static.serveIndex = opts.staticServeIndex;
      delete opts.staticServeIndex;
    },
  },
  'static-watch': {
    configs: [
      {
        type: 'boolean',
        multiple: true,
        description: 'Watch for files in static content directory.',
        path: 'static[].watch',
      },
    ],
    description: 'Watch for files in static content directory.',
    negatedDescription: 'Do not watch for files in static content directory.',
    simpleType: 'boolean',
    multiple: true,
    processor(opts) {
      opts.static = normalizeOption(opts.static);
      opts.static.watch = opts.staticWatch;
      delete opts.staticWatch;
    },
  },
  'static-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description: 'Clear all items provided in static configuration.',
        path: 'static',
      },
    ],
    description: 'Clear all items provided in static configuration.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.static = opts.static || [];
      delete opts.staticReset;
    },
  },
  'static-public-path-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          'Clear all items provided in static.publicPath configuration.',
        path: 'static.publicPath',
      },
    ],
    description: 'Clear all items provided in static.publicPath configuration.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.static = normalizeOption(opts.static);
      opts.static.publicPath = opts.staticPublicPath || [];
      delete opts.staticPublicPathReset;
    },
  },
  'watch-files': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description: 'List of files to watch for file changes and serve.',
        path: 'watchFiles[]',
      },
    ],
    description: 'List of files to watch for file changes and serve.',
    simpleType: 'string',
    multiple: true,
  },
  'watch-files-paths': {
    configs: [
      {
        type: 'string',
        multiple: true,
        description: 'List of files to watch for file changes and serve.',
        path: 'watchFiles[].paths',
      },
      {
        type: 'string',
        multiple: true,
        description: 'List of files to watch for file changes and serve.',
        path: 'watchFiles.paths[]',
      },
    ],
    description: 'List of files to watch for file changes and serve.',
    simpleType: 'string',
    multiple: true,
    processor(opts) {
      opts.watchFiles = normalizeOption(opts.watchFiles);
      opts.watchFiles.paths = opts.watchFilesPaths;
      delete opts.watchFilesPaths;
    },
  },
  'watch-files-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description: 'Clear all items provided in watchFiles configuration.',
        path: 'watchFiles',
      },
    ],
    description: 'Clear all items provided in watchFiles configuration.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.watchFiles = opts.watchFiles || [];
      delete opts.watchFilesReset;
    },
  },
  'watch-files-paths-reset': {
    configs: [
      {
        type: 'reset',
        multiple: false,
        description:
          'Clear all items provided in watchFiles.paths configuration.',
        path: 'watchFiles.paths',
      },
    ],
    description: 'Clear all items provided in watchFiles.paths configuration.',
    simpleType: 'boolean',
    multiple: false,
    processor(opts) {
      opts.watchFiles = normalizeOption(opts.watchFiles);
      opts.watchFiles.paths = opts.watchFilesPaths || [];
      delete opts.watchFilesPathsReset;
    },
  },
};
