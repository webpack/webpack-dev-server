'use strict';

module.exports = {
  devServer: [
    {
      name: 'host',
      type: String,
      description: 'The hostname/ip address the server will bind to',
    },
    {
      name: 'port',
      type: Number,
      description: 'The port',
    },
    {
      name: 'static',
      type: [String, Boolean],
      description: 'A directory to serve static content from.',
      multiple: true,
      negative: true,
    },
    {
      name: 'live-reload',
      type: Boolean,
      description: 'Enables/Disables live reloading on changing files',
      negative: true,
    },
    {
      name: 'https',
      type: Boolean,
      description: 'HTTPS',
    },
    {
      name: 'http2',
      type: Boolean,
      description: 'HTTP/2, must be used with HTTPS',
    },
    {
      name: 'bonjour',
      type: Boolean,
      description: 'Broadcasts the server via ZeroConf networking on start',
    },
    {
      name: 'client-progress',
      type: Boolean,
      description: 'Print compilation progress in percentage in the browser',
      processor(opts) {
        opts.client = opts.client || {};
        opts.client.progress = opts.clientProgress;
        delete opts.clientProgress;
      },
    },
    {
      name: 'hot-only',
      type: Boolean,
      description: 'Do not refresh page if HMR fails',
      processor(opts) {
        opts.hot = 'only';
        delete opts.hotOnly;
      },
    },
    {
      name: 'setup-exit-signals',
      type: Boolean,
      description: 'Close and exit the process on SIGINT and SIGTERM',
      negative: true,
    },
    {
      name: 'stdin',
      type: Boolean,
      description: 'Close when stdin ends',
    },
    {
      name: 'open',
      type: [String, Boolean],
      description:
        'Open the default browser, or optionally specify a browser name',
    },
    {
      name: 'use-local-ip',
      type: Boolean,
      description: 'Open default browser with local IP',
    },
    {
      name: 'open-page',
      type: String,
      description: 'Open default browser with the specified page',
      multiple: true,
    },
    {
      name: 'client-logging',
      type: String,
      description:
        'Log level in the browser (none, error, warn, info, log, verbose)',
      processor(opts) {
        opts.client = opts.client || {};
        opts.client.logging = opts.clientLogging;
        delete opts.clientLogging;
      },
    },
    {
      name: 'history-api-fallback',
      type: Boolean,
      description: 'Fallback to /index.html for Single Page Applications.',
    },
    {
      name: 'compress',
      type: Boolean,
      description: 'Enable gzip compression',
    },
    {
      name: 'public',
      type: String,
      description: 'The public hostname/ip address of the server',
    },
    {
      name: 'firewall',
      type: String,
      description:
        'Enable/disable firewall, or set hosts that are allowed to access the dev server',
      multiple: true,
    },
  ],
};
