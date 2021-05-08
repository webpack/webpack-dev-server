'use strict';

module.exports = {
  host: {
    name: 'host',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'The hostname/ip address the server will bind to.',
  },
  port: {
    name: 'port',
    type: Number,
    configs: [
      {
        type: 'number',
      },
    ],
    description: 'The port server will listen to.',
  },
  static: {
    name: 'static',
    type: [String, Boolean],
    configs: [
      {
        type: 'string',
      },
      {
        type: 'boolean',
      },
    ],
    description: 'A directory to serve static content from.',
    multiple: true,
    negative: true,
  },
  'static-directory': {
    name: 'static-directory',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'Directory for static contents.',
    processor(opts) {
      opts.static = opts.static || {};
      opts.static.directory = opts.staticDirectory;
      delete opts.staticDirectory;
    },
  },
  'static-public-path': {
    name: 'static-public-path',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description:
      'The bundled files will be available in the browser under this path.',
    multiple: true,
    processor(opts) {
      opts.static = opts.static || {};
      opts.static.publicPath = opts.staticPublicPath;
      delete opts.staticPublicPath;
    },
  },
  'static-serve-index': {
    name: 'static-serve-index',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Tells dev-server to use serveIndex middleware.',
    negatedDescription: 'Do not tell dev-server to use serveIndex middleware.',
    negative: true,
    processor(opts) {
      opts.static = opts.static || {};
      opts.static.serveIndex = opts.staticServeIndex;
      delete opts.staticServeIndex;
    },
  },
  'static-watch': {
    name: 'static-watch',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Watch for files in static content directory.',
    negatedDescription: 'Do not watch for files in static content directory.',
    negative: true,
    processor(opts) {
      opts.static = opts.static || {};
      opts.static.watch = opts.staticWatch;
      delete opts.staticWatch;
    },
  },
  'live-reload': {
    name: 'live-reload',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Enables live reloading on changing files.',
    negatedDescription: 'Disables live reloading on changing files.',
    negative: true,
  },
  https: {
    name: 'https',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Use HTTPS protocol.',
    negatedDescription: 'Do not use HTTPS protocol.',
    negative: true,
  },
  'https-passphrase': {
    name: 'https-passphrase',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'Passphrase for a pfx file.',
    processor(opts) {
      opts.https = opts.https || {};
      opts.https.passphrase = opts.httpsPassphrase;
      delete opts.httpsPassphrase;
    },
  },
  'https-key': {
    name: 'https-key',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'Path to an SSL key.',
    processor(opts) {
      opts.https = opts.https || {};
      opts.https.key = opts.httpsKey;
      delete opts.httpsKey;
    },
  },
  'https-pfx': {
    name: 'https-pfx',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'Path to an SSL pfx file.',
    processor(opts) {
      opts.https = opts.https || {};
      opts.https.pfx = opts.httpsPfx;
      delete opts.httpsPfx;
    },
  },
  'https-cert': {
    name: 'https-cert',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'Path to an SSL certificate.',
    processor(opts) {
      opts.https = opts.https || {};
      opts.https.cert = opts.httpsCert;
      delete opts.httpsCert;
    },
  },
  'https-cacert': {
    name: 'https-cacert',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'Path to an SSL CA certificate.',
    processor(opts) {
      opts.https = opts.https || {};
      opts.https.cacert = opts.httpsCacert;
      delete opts.httpsCacert;
    },
  },
  'https-request-cert': {
    name: 'https-request-cert',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Request for an SSL certificate.',
    negatedDescription: 'Do not request for an SSL certificate.',
    processor(opts) {
      opts.https = opts.https || {};
      opts.https.requestCert = opts.httpsRequestCert;
      delete opts.httpsRequestCert;
    },
  },
  http2: {
    name: 'http2',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Use HTTP/2, must be used with HTTPS.',
    negatedDescription: 'Do not use HTTP/2.',
    negative: true,
  },
  bonjour: {
    name: 'bonjour',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Broadcasts the server via ZeroConf networking on start.',
    negatedDescription:
      'Do not broadcast the server via ZeroConf networking on start.',
    negative: true,
  },
  'client-progress': {
    name: 'client-progress',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Print compilation progress in percentage in the browser.',
    negatedDescription:
      'Do not print compilation progress in percentage in the browser.',
    negative: true,
    processor(opts) {
      opts.client = opts.client || {};
      opts.client.progress = opts.clientProgress;
      delete opts.clientProgress;
    },
  },
  'client-overlay': {
    name: 'client-overlay',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description:
      'Show a full-screen overlay in the browser when there are compiler errors or warnings.',
    negatedDescription:
      'Do not show a full-screen overlay in the browser when there are compiler errors or warnings.',
    negative: true,
    processor(opts) {
      opts.client = opts.client || {};
      opts.client.overlay = opts.clientOverlay;
      delete opts.clientOverlay;
    },
  },
  // TODO remove in the next major release in favor `--open-target`
  open: {
    name: 'open',
    type: [Boolean, String],
    multiple: true,
    configs: [
      {
        type: 'boolean',
      },
      {
        type: 'string',
      },
    ],
    description: 'Open the default browser.',
    negatedDescription: 'Do not open the default browser.',
    negative: true,
  },
  'open-app': {
    name: 'open-app',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'Open specified browser.',
    processor(opts) {
      opts.open = opts.open || {};
      opts.open.app = opts.openApp.split(' ');
      delete opts.openApp;
    },
  },
  'open-target': {
    name: 'open-target',
    type: [Boolean, String],
    configs: [
      {
        type: 'boolean',
      },
      {
        type: 'string',
      },
    ],
    description: 'Open specified route in browser.',
    processor(opts) {
      opts.open = opts.open || {};
      opts.open.target = opts.openTarget;
      delete opts.openTarget;
    },
    negatedDescription: 'Do not open specified route in browser.',
    multiple: true,
    negative: true,
  },
  'client-logging': {
    name: 'client-logging',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description:
      'Log level in the browser (none, error, warn, info, log, verbose).',
    processor(opts) {
      opts.client = opts.client || {};
      opts.client.logging = opts.clientLogging;
      delete opts.clientLogging;
    },
  },
  'history-api-fallback': {
    name: 'history-api-fallback',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Fallback to /index.html for Single Page Applications.',
    negatedDescription:
      'Do not fallback to /index.html for Single Page Applications.',
    negative: true,
  },
  compress: {
    name: 'compress',
    type: Boolean,
    configs: [
      {
        type: 'boolean',
      },
    ],
    description: 'Enable gzip compression.',
    negatedDescription: 'Disable gzip compression.',
    negative: true,
  },
  public: {
    name: 'public',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'The public hostname/ip address of the server.',
  },
  firewall: {
    name: 'firewall',
    type: [Boolean, String],
    configs: [
      {
        type: 'boolean',
      },
      {
        type: 'string',
      },
    ],
    description:
      'Enable firewall or set hosts that are allowed to access the dev server.',
    negatedDescription: 'Disable firewall.',
    multiple: true,
    negative: true,
  },
  'watch-files': {
    name: 'watch-files',
    type: String,
    configs: [
      {
        type: 'string',
      },
    ],
    description: 'Watch static files for file changes.',
    multiple: true,
  },
};
