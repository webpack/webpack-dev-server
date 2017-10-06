'use strict';

const webpack = require('webpack');
const Server = require('../lib/Server');

module.exports = {
  start(config, options, done) {
    // eslint-disable-next-line no-undefined
    if (options.quiet === undefined) {
      options.quiet = true;
    }

    options.publicPath = options.publicPath || '/';

    const compiler = webpack(config);
    const server = new Server(compiler, options);

    server.listen(8080, 'localhost', (err) => {
      if (err) return done(err);
      done();
    });

    return server;
  },
  close(server, done) {
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
