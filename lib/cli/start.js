'use strict';

const fs = require('fs');
const net = require('net');
const chalk = require('chalk');
const symbols = require('log-symbols');
const webpack = require('webpack');
const { addEntry, createDomain } = require('../util');
const OptionsValidationError = require('../OptionsValidationError');
const DevServer = require('../DevServer');
const { ready, broadcastZeroConf } = require('./util');

function listen(argv, options, devServer) {
  const suffix = (options.inline !== false || options.lazy === true) ? '/' : '/webpack-dev-server/';
  const { server } = devServer;

  if (options.socket) {
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        const clientSocket = new net.Socket();
        clientSocket.on('error', (clientError) => {
          if (clientError.code === 'ECONNREFUSED') {
            // No other server listening on this socket so it can be safely removed
            fs.unlinkSync(options.socket);
            server.listen(options.socket, options.host, (err) => {
              if (err) {
                throw err;
              }
            });
          }
        });
        clientSocket.connect({ path: options.socket }, () => {
          throw new Error('The socket is already in use');
        });
      }
    });

    devServer.listen((err) => {
      if (err) throw err;
      // chmod 666 (rw rw rw)
      const READ_WRITE = 438;
      fs.chmod(options.socket, READ_WRITE, (fsError) => {
        if (fsError) {
          throw fsError;
        }

        const uri = createDomain(options, server) + suffix;
        ready(argv, options, uri);
      });
    });
  } else {
    devServer.listen((err) => {
      if (err) {
        throw err;
      }

      if (options.bonjour) {
        broadcastZeroConf(options);
      }

      const uri = createDomain(options, server) + suffix;
      ready(argv, options, uri);
    });
  }
}

module.exports = function start(argv, devServerOptions, webpackOptions) {
  addEntry(webpackOptions, devServerOptions);

  const useColor = devServerOptions.stats.colors;
  let compiler;

  let server;

  try {
    compiler = webpack(webpackOptions);
  } catch (e) {
    if (e instanceof webpack.WebpackOptionsValidationError) {
      const message = useColor ? chalk.red(e.message) : e.message;
      console.error(`${symbols.error} ${message}`); // eslint-disable-line
      process.exit(1); // eslint-disable-line
    }

    throw e;
  }

  if (argv.progress) {
    for (const comp of [].concat(compiler.compilers || compiler)) {
      comp.apply(new webpack.ProgressPlugin({
        profile: argv.profile
      }));
    }
  }

  try {
    server = new DevServer(compiler, devServerOptions);
  } catch (e) {
    if (e instanceof OptionsValidationError) {
      const message = useColor ? chalk.red(e.message) : e.message;
      console.error(`${symbols.error} ${message}`); // eslint-disable-line
      process.exit(1); // eslint-disable-line
    }
    throw e;
  }

  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => {
      server.close();
      process.exit(); // eslint-disable-line
    });
  }

  listen(argv, devServerOptions, server);
};
