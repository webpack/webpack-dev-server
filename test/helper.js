'use strict';

const webpack = require('webpack');
const DevServer = require('../lib/DevServer');

module.exports = {
  start(config, options, done) {
    // eslint-disable-next-line no-undefined
    if (options.quiet === undefined) {
      options.quiet = true;
    }

    options.publicPath = options.publicPath || '/';

    const compiler = webpack(config);
    const server = new DevServer(compiler, options);

    server.listen((err) => {
      if (err) {
        console.log(err);
        return done(err);
      }
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
