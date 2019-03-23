'use strict';

const webpack = require('webpack');
const Server = require('../lib/Server');

let server;

module.exports = {
  // start server, returning the full setup of the server
  // (both the server and the compiler)
  startFullSetup(config, options, done) {
    // eslint-disable-next-line no-undefined
    if (options.quiet === undefined) {
      options.quiet = true;
    }
    const compiler = webpack(config);
    server = new Server(compiler, options);

    const port = options.port || 8080;
    const host = options.host || 'localhost';
    server.listen(port, host, (err) => {
      if (err) return done(err);
      done();
    });

    return {
      server,
      compiler,
    };
  },
  startAwaitingCompilation(config, options, done) {
    let readyCount = 0;
    const ready = () => {
      readyCount += 1;
      if (readyCount === 2) {
        done();
      }
    };

    const fullSetup = this.startFullSetup(config, options, ready);
    // wait for compilation, since dev server can start before this
    // https://github.com/webpack/webpack-dev-server/issues/847
    fullSetup.compiler.hooks.done.tap('done', ready);
    return fullSetup.server;
  },
  start(config, options, done) {
    return this.startFullSetup(config, options, done).server;
  },
  close(done) {
    if (server) {
      server.close(() => {
        server = null;
        done();
      });
    } else {
      done();
    }
  },
};
