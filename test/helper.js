'use strict';

const webpack = require('webpack');
const Server = require('../lib/Server');

let server;

module.exports = {
  start(config, options, done) {
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

    return server;
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
