'use strict';

const ADVANCED_GROUP = 'Advanced options:';
const DISPLAY_GROUP = 'Stats options:';
const SSL_GROUP = 'SSL options:';
const CONNECTION_GROUP = 'Connection options:';
const RESPONSE_GROUP = 'Response options:';
const BASIC_GROUP = 'Basic options:';

const options = {
  bonjour: {
    type: 'boolean',
    describe: 'Broadcasts the server via ZeroConf networking on start',
  },
  'live-reload': {
    type: 'boolean',
    describe: 'Enables/Disables live reloading on changing files',
    default: true,
  },
  profile: {
    type: 'boolean',
    describe: 'Print compilation profile data for progress steps',
  },
  progress: {
    type: 'boolean',
    describe: 'Print compilation progress in percentage',
    group: BASIC_GROUP,
  },
  hot: {
    type: 'boolean',
    describe: 'Enables/disables HMR',
    group: ADVANCED_GROUP,
  },
  'hot-only': {
    type: 'boolean',
    describe: 'Do not refresh page if HMR fails',
    group: ADVANCED_GROUP,
  },
  stdin: {
    type: 'boolean',
    describe: 'close when stdin ends',
  },
  open: {
    type: 'string',
    describe: 'Open the default browser, or optionally specify a browser name',
  },
  'use-local-ip': {
    type: 'boolean',
    describe: 'Open default browser with local IP',
  },
  'open-page': {
    type: 'string',
    describe: 'Open default browser with the specified page',
    requiresArg: true,
  },
  'client-logging': {
    type: 'string',
    group: DISPLAY_GROUP,
    default: 'info',
    describe:
      'Log level in the browser (none, error, warn, info, log, verbose)',
  },
  https: {
    type: 'boolean',
    group: SSL_GROUP,
    describe: 'HTTPS',
  },
  http2: {
    type: 'boolean',
    group: SSL_GROUP,
    describe: 'HTTP/2, must be used with HTTPS',
  },
  static: {
    type: 'string',
    describe:
      'A comma-delimited string of directories to serve static content from.',
    group: RESPONSE_GROUP,
  },
  'history-api-fallback': {
    type: 'boolean',
    describe: 'Fallback to /index.html for Single Page Applications.',
    group: RESPONSE_GROUP,
  },
  compress: {
    type: 'boolean',
    describe: 'Enable gzip compression',
    group: RESPONSE_GROUP,
  },
  port: {
    describe: 'The port',
    group: CONNECTION_GROUP,
  },
  'disable-host-check': {
    type: 'boolean',
    describe: 'Will not check the host',
    group: CONNECTION_GROUP,
  },
  public: {
    type: 'string',
    describe: 'The public hostname/ip address of the server',
    group: CONNECTION_GROUP,
  },
  host: {
    type: 'string',
    default: 'localhost',
    describe: 'The hostname/ip address the server will bind to',
    group: CONNECTION_GROUP,
  },
  'allowed-hosts': {
    type: 'string',
    describe:
      'A comma-delimited string of hosts that are allowed to access the dev server',
    group: CONNECTION_GROUP,
  },
};

module.exports = options;
