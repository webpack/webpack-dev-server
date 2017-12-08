'use strict';

const yargs = require('yargs');
const webpackVersion = require('webpack/package.json').version;
const { version } = require('../../package.json');

const GROUP_ADVANCED = 'Advanced options:';
const GROUP_DISPLAY = 'Stats options:';
const GROUP_SSL = 'SSL options:';
const GROUP_CONNECTION = 'Connection options:';
const GROUP_RESPONSE = 'Response options:';
const GROUP_BASIC = 'Basic options:';

const flags = {
  'allowed-hosts': {
    type: 'string',
    describe: 'A comma-delimited string of hosts that are allowed to access the dev server',
    group: GROUP_CONNECTION
  },
  bonjour: {
    type: 'boolean',
    describe: 'Broadcasts the server via ZeroConf networking on start'
  },
  cacert: {
    type: 'string',
    describe: 'Path to a SSL CA certificate.',
    group: GROUP_SSL
  },
  cert: {
    type: 'string',
    describe: 'Path to a SSL certificate.',
    group: GROUP_SSL
  },
  'client-log-level': {
    type: 'string',
    group: GROUP_DISPLAY,
    default: 'info',
    describe: 'Log level in the browser (info, warning, error or none)'
  },
  color: {
    type: 'boolean',
    alias: 'colors',
    // eslint-disable-next-line
    default: () => require('supports-color'),
    group: GROUP_DISPLAY,
    describe: 'Enables/Disables colors on the console'
  },
  compress: {
    type: 'boolean',
    describe: 'Enable gzip compression',
    group: GROUP_RESPONSE
  },
  'content-base': {
    type: 'string',
    describe: 'A directory or URL to serve HTML content from.',
    group: GROUP_RESPONSE
  },
  'disable-host-check': {
    type: 'boolean',
    describe: 'Will not check the host',
    group: GROUP_CONNECTION
  },
  'history-api-fallback': {
    type: 'boolean',
    describe: 'Fallback to /index.html for Single Page Applications.',
    group: GROUP_RESPONSE
  },
  host: {
    type: 'string',
    default: 'localhost',
    describe: 'The hostname/ip address the server will bind to',
    group: GROUP_CONNECTION
  },
  'hot-only': {
    type: 'boolean',
    describe: 'Do not refresh page if HMR fails',
    group: GROUP_ADVANCED
  },
  https: {
    type: 'boolean',
    group: GROUP_SSL,
    describe: 'HTTPS'
  },
  info: {
    type: 'boolean',
    group: GROUP_DISPLAY,
    default: true,
    describe: 'Info'
  },
  inline: {
    type: 'boolean',
    default: true,
    describe: 'Inline mode (set to false to disable including client scripts like livereload)'
  },
  key: {
    type: 'string',
    describe: 'Path to a SSL key.',
    group: GROUP_SSL
  },
  lazy: {
    type: 'boolean',
    describe: 'Lazy'
  },
  logLevel: {
    type: 'string',
    alias: 'loglevel',
    group: GROUP_DISPLAY,
    default: 'info',
    describe: 'Log level in the terminal/console (trace, debug, info, warning, error or none)'
  },
  open: {
    type: 'string',
    describe: 'Open the default browser, or optionally specify a browser name'
  },
  'open-page': {
    type: 'string',
    describe: 'Open default browser with the specified page',
    requiresArg: true
  },
  pfx: {
    type: 'string',
    describe: 'Path to a SSL pfx file.',
    group: GROUP_SSL
  },
  'pfx-passphrase': {
    type: 'string',
    describe: 'Passphrase for pfx file.',
    group: GROUP_SSL
  },
  port: {
    describe: 'The port',
    group: GROUP_CONNECTION
  },
  progress: {
    type: 'boolean',
    describe: 'Print compilation progress in percentage',
    group: GROUP_BASIC
  },
  public: {
    type: 'string',
    describe: 'The public hostname/ip address of the server',
    group: GROUP_CONNECTION
  },
  quiet: {
    type: 'boolean',
    group: GROUP_DISPLAY,
    describe: 'Quiet'
  },
  socket: {
    type: 'String',
    describe: 'Socket to listen',
    group: GROUP_CONNECTION
  },
  stdin: {
    type: 'boolean',
    describe: 'Close the server when stdin ends'
  },
  useLocalIp: {
    type: 'boolean',
    describe: 'Open default browser with local IP'
  },
  'watch-content-base': {
    type: 'boolean',
    describe: 'Enable live-reloading of the content-base.',
    group: GROUP_RESPONSE
  }
};

yargs
  .version(version)
  .options(flags)
  .help('help')
  .alias('help', 'h')
  .alias('version', 'v')
  .usage(`webpack-dev-server ${version}
webpack ${webpackVersion}
Usage: https://webpack.js.org/configuration/dev-server/`)
  .strict();

const { argv } = yargs;

// in prior versions webpack-dev-server binary was manually setting all options
// since that's is done with defaults and Object.assign now, we have to prune
// options that were morphed/inherited from webpack proper.
delete argv.watchStdin;
delete argv['watch-stdin'];
delete argv.loglevel;

module.exports = { argv, yargs };
