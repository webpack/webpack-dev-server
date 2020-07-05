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
      defaultValue: true,
      describe: 'Enables/Disables live reloading on changing files',
    },
    {
      name: 'static-serve-index',
      type: Boolean,
      describe: 'Enables/Disables serveIndex middleware',
      defaultValue: true,
    },
    {
      name: 'profile',
      type: Boolean,
      describe: 'Print compilation profile data for progress steps',
    },
    {
      name: 'progress',
      type: Boolean,
      describe: 'Print compilation progress in percentage',
      group: BASIC_GROUP,
    },
    {
      name: 'hot-only',
      type: Boolean,
      describe: 'Do not refresh page if HMR fails',
      group: ADVANCED_GROUP,
    },
    {
      name: 'stdin',
      type: Boolean,
      describe: 'close when stdin ends',
    },
    {
      name: 'open',
      type: String,
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
    },
    {
      name: 'client-logging',
      type: String,
      group: DISPLAY_GROUP,
      defaultValue: 'info',
      describe:
        'Log level in the browser (none, error, warn, info, log, verbose)',
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
      name: 'static-directory',
      type: String,
      describe: 'A directory or URL to serve HTML content from.',
      group: RESPONSE_GROUP,
    },
    {
      name: 'static-watch',
      type: Boolean,
      describe: 'Enable live-reloading of the static directory.',
      group: RESPONSE_GROUP,
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
    // findPort is currently not set up
    {
      name: 'port',
      type: Number,
      describe: 'The port',
      group: CONNECTION_GROUP,
    },
    {
      name: 'disable-host-check',
      type: Boolean,
      describe: 'Will not check the host',
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
    // use command-line-args "multiple" option, allowing the usage: --allowed-hosts host1 host2 host3
    // instead of the old, comma-separated syntax: --allowed-hosts host1,host2,host3
    {
      name: 'allowed-hosts',
      type: String,
      describe:
        'A list of hosts that are allowed to access the dev server, separated by spaces',
      group: CONNECTION_GROUP,
      multiple: true,
    },
  ],
};
