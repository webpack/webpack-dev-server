#!/usr/bin/env node

'use strict';

/* eslint-disable
  import/order,
  no-shadow,
  no-console
*/
const debug = require('debug')('webpack-dev-server');

const fs = require('fs');
const net = require('net');

const importLocal = require('import-local');

const yargs = require('yargs');
const webpack = require('webpack');

const options = require('./options');
const Server = require('../lib/Server');

const addEntries = require('../lib/utils/addEntries');
const colors = require('../lib/utils/colors');
const createConfig = require('../lib/utils/createConfig');
const createDomain = require('../lib/utils/createDomain');
const createLogger = require('../lib/utils/createLogger');
const defaultTo = require('../lib/utils/defaultTo');
const findPort = require('../lib/utils/findPort');
const getVersions = require('../lib/utils/getVersions');
const runBonjour = require('../lib/utils/runBonjour');
const status = require('../lib/utils/status');
const tryParseInt = require('../lib/utils/tryParseInt');

let server;

const signals = ['SIGINT', 'SIGTERM'];

signals.forEach((signal) => {
  process.on(signal, () => {
    if (server) {
      server.close(() => {
        // eslint-disable-next-line no-process-exit
        process.exit();
      });
    } else {
      // eslint-disable-next-line no-process-exit
      process.exit();
    }
  });
});

// Prefer the local installation of webpack-dev-server
if (importLocal(__filename)) {
  debug('Using local install of webpack-dev-server');

  return;
}

try {
  require.resolve('webpack-cli');
} catch (err) {
  console.error('The CLI moved into a separate package: webpack-cli');
  console.error(
    "Please install 'webpack-cli' in addition to webpack itself to use the CLI"
  );
  console.error('-> When using npm: npm i -D webpack-cli');
  console.error('-> When using yarn: yarn add -D webpack-cli');

  process.exitCode = 1;
}

yargs.usage(
  `${getVersions()}\nUsage:  https://webpack.js.org/configuration/dev-server/`
);

// webpack-cli@3.3 path : 'webpack-cli/bin/config/config-yargs'
let configYargsPath;
try {
  require.resolve('webpack-cli/bin/config/config-yargs');
  configYargsPath = 'webpack-cli/bin/config/config-yargs';
} catch (e) {
  configYargsPath = 'webpack-cli/bin/config-yargs';
}
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-dynamic-require
require(configYargsPath)(yargs);

// It is important that this is done after the webpack yargs config,
// so it overrides webpack's version info.
yargs.version(getVersions());
yargs.options(options);

const argv = yargs.argv;

// webpack-cli@3.3 path : 'webpack-cli/bin/utils/convert-argv'
let convertArgvPath;
try {
  require.resolve('webpack-cli/bin/utils/convert-argv');
  convertArgvPath = 'webpack-cli/bin/utils/convert-argv';
} catch (e) {
  convertArgvPath = 'webpack-cli/bin/convert-argv';
}
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-dynamic-require
const config = require(convertArgvPath)(yargs, argv, {
  outputFilename: '/bundle.js',
});

// Taken out of yargs because we must know if
// it wasn't given by the user, in which case
// we should use portfinder.
const DEFAULT_PORT = 8080;

// Try to find unused port and listen on it for 3 times,
// if port is not specified in options.
// Because NaN == null is false, defaultTo fails if parseInt returns NaN
// so the tryParseInt function is introduced to handle NaN
const defaultPortRetry = defaultTo(
  tryParseInt(process.env.DEFAULT_PORT_RETRY),
  3
);

function processOptions(config) {
  // processOptions {Promise}
  if (typeof config.then === 'function') {
    config.then(processOptions).catch((err) => {
      console.error(err.stack || err);
      // eslint-disable-next-line no-process-exit
      process.exit();
    });

    return;
  }

  const options = createConfig(config, argv, { port: DEFAULT_PORT });
  startDevServer(config, options);
}

function startDevServer(config, options) {
  const log = createLogger(options);

  addEntries(config, options);

  let compiler;

  try {
    compiler = webpack(config);
  } catch (err) {
    if (err instanceof webpack.WebpackOptionsValidationError) {
      log.error(colors.error(options.stats.colors, err.message));
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }

    throw err;
  }

  if (options.progress) {
    new webpack.ProgressPlugin({
      profile: argv.profile,
    }).apply(compiler);
  }

  const suffix =
    options.inline !== false || options.lazy === true
      ? '/'
      : '/webpack-dev-server/';

  try {
    server = new Server(compiler, options, log);
  } catch (err) {
    if (err.name === 'ValidationError') {
      log.error(colors.error(options.stats.colors, err.message));
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }

    throw err;
  }

  if (options.socket) {
    server.listeningApp.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        const clientSocket = new net.Socket();

        clientSocket.on('error', (err) => {
          if (err.code === 'ECONNREFUSED') {
            // No other server listening on this socket so it can be safely removed
            fs.unlinkSync(options.socket);

            server.listen(options.socket, options.host, (error) => {
              if (error) {
                throw error;
              }
            });
          }
        });

        clientSocket.connect({ path: options.socket }, () => {
          throw new Error('This socket is already used');
        });
      }
    });

    server.listen(options.socket, options.host, (err) => {
      if (err) {
        throw err;
      }
      // chmod 666 (rw rw rw)
      const READ_WRITE = 438;

      fs.chmod(options.socket, READ_WRITE, (err) => {
        if (err) {
          throw err;
        }

        const uri = createDomain(options, server.listeningApp) + suffix;

        status(uri, options, log, argv.color);
      });
    });
    return;
  }

  const startServer = () => {
    server.listen(options.port, options.host, (err) => {
      if (err) {
        throw err;
      }
      if (options.bonjour) {
        runBonjour(options);
      }
      const uri = createDomain(options, server.listeningApp) + suffix;
      status(uri, options, log, argv.color);
    });
  };

  if (options.port) {
    startServer();
    return;
  }

  // only run port finder if no port as been specified
  findPort(server, DEFAULT_PORT, defaultPortRetry, (err, port) => {
    if (err) {
      throw err;
    }
    options.port = port;
    startServer();
  });
}

processOptions(config);
