'use strict';

const ADVANCED_GROUP = 'Advanced options:';
const DISPLAY_GROUP = 'Stats options:';
const SSL_GROUP = 'SSL options:';
const CONNECTION_GROUP = 'Connection options:';
const RESPONSE_GROUP = 'Response options:';
const BASIC_GROUP = 'Basic options:';

module.exports = {
  devServer: [
    {
      name: 'bonjour',
      type: Boolean,
      describe: 'Broadcasts the server via ZeroConf networking on start',
    },
    {
      name: 'live-reload',
      type: Boolean,
      describe: 'Enables/Disables live reloading on changing files',
      negative: true,
    },
    {
      name: 'client-progress',
      type: Boolean,
      describe: 'Print compilation progress in percentage in the browser',
      group: BASIC_GROUP,
      processor(opts) {
        opts.client = opts.client || {};
        opts.client.progress = opts.clientProgress;
        delete opts.clientProgress;
      },
    },
    {
      name: 'hot-only',
      type: Boolean,
      describe: 'Do not refresh page if HMR fails',
      group: ADVANCED_GROUP,
      processor(opts) {
        opts.hot = 'only';
        delete opts.hotOnly;
      },
    },
    {
      name: 'setup-exit-signals',
      type: Boolean,
      describe: 'Close and exit the process on SIGINT and SIGTERM',
      group: ADVANCED_GROUP,
      defaultValue: true,
      negative: true,
    },
    {
      name: 'stdin',
      type: Boolean,
      describe: 'close when stdin ends',
    },
    {
      name: 'open',
      type: [String, Boolean],
      describe:
        'Open the default browser, or optionally specify a browser name',
    },
    {
      name: 'use-local-ip',
      type: Boolean,
      describe: 'Open default browser with local IP',
    },
    {
      name: 'open-page',
      type: String,
      describe: 'Open default browser with the specified page',
      multiple: true,
    },
    {
      name: 'client-logging',
      type: String,
      group: DISPLAY_GROUP,
      describe:
        'Log level in the browser (none, error, warn, info, log, verbose)',
      processor(opts) {
        opts.client = opts.client || {};
        opts.client.logging = opts.clientLogging;
        delete opts.clientLogging;
      },
    },
    {
      name: 'https',
      type: Boolean,
      group: SSL_GROUP,
      describe: 'HTTPS',
    },
    {
      name: 'http2',
      type: Boolean,
      group: SSL_GROUP,
      describe: 'HTTP/2, must be used with HTTPS',
    },
    {
      name: 'static',
      type: [String, Boolean],
      describe: 'A directory to serve static content from.',
      group: RESPONSE_GROUP,
      multiple: true,
      negative: true,
    },
    {
      name: 'history-api-fallback',
      type: Boolean,
      describe: 'Fallback to /index.html for Single Page Applications.',
      group: RESPONSE_GROUP,
    },
    {
      name: 'compress',
      type: Boolean,
      describe: 'Enable gzip compression',
      group: RESPONSE_GROUP,
    },
    {
      name: 'port',
      type: Number,
      describe: 'The port',
      group: CONNECTION_GROUP,
    },
    {
      name: 'public',
      type: String,
      describe: 'The public hostname/ip address of the server',
      group: CONNECTION_GROUP,
    },
    {
      name: 'host',
      type: String,
      describe: 'The hostname/ip address the server will bind to',
      group: CONNECTION_GROUP,
    },
    {
      name: 'firewall',
      type: String,
      describe:
        'Enable/disable firewall, or set hosts that are allowed to access the dev server',
      group: CONNECTION_GROUP,
      multiple: true,
    },
  ],
};
