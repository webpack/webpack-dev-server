

const Server = require('../lib/Server');
const webpack = require('webpack');

let server;

module.exports = {
  start(config, options, done) {
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
  },
};
