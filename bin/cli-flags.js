'use strict';

module.exports = {
  devServer: [
    {
      name: 'host',
      type: String,
      configs: [
        {
          type: 'string',
        },
      ],
      description: 'The hostname/ip address the server will bind to.',
    },
    {
      name: 'port',
      type: Number,
      configs: [
        {
          type: 'number',
        },
      ],
      description: 'The port server will listen to.',
    },
    {
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
    {
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
    {
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
    {
      name: 'static-serve-index',
      type: Boolean,
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Tells dev-server to use serveIndex middleware.',
      negatedDescription:
        'Do not tell dev-server to use serveIndex middleware.',
      negative: true,
      processor(opts) {
        opts.static = opts.static || {};
        opts.static.serveIndex = opts.staticServeIndex;
        delete opts.staticServeIndex;
      },
    },
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
    {
      name: 'open-target',
      type: String,
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
    {
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
    {
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
    {
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
    {
      name: 'public',
      type: String,
      configs: [
        {
          type: 'string',
        },
      ],
      description: 'The public hostname/ip address of the server.',
    },
    {
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
    {
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
  ],
};
