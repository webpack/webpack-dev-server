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

    server.listen(8080, 'localhost', (err) => {
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
  }
};
