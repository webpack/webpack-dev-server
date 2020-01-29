'use strict';

/* eslint-disable
  no-undefined
*/

const webpack = require('webpack');
const Server = require('../../lib/Server');

let server;

// start server, returning the full setup of the server
// (both the server and the compiler)
function startFullSetup(config, options, done) {
  if (options.quiet === undefined) {
    options.quiet = true;
  }

  // originally, inline was not working by default for tests with the API
  // if you need to test inline, it should be set explicitly,
  // rather than expecting it to be defaulted to
  // (the only test that relied on inline before this point was Client.test.js)
  if (
    options.inline === undefined &&
    options.hot === undefined &&
    options.liveReload === undefined
  ) {
    options.inline = false;
  }

  // defaulting to this will hopefully help with problems on OSX in tests
  if (options.watchOptions === undefined) {
    options.watchOptions = {
      poll: true,
    };
  }

  const compiler = webpack(config);

  server = new Server(compiler, options);

  // originally the fallback default was 8080, but it should be
  // undefined so that the server.listen method can choose it for us,
  // and thus prevent port mapping collision between tests
  let port;
  if (Object.prototype.hasOwnProperty.call(options, 'port')) {
    port = options.port;
  } else if (Object.prototype.hasOwnProperty.call(options, 'socket')) {
    port = options.socket;
  } else {
    // TODO: remove this when findPort is implemented in the server.listen method
    port = 8080;
  }

  const host = Object.prototype.hasOwnProperty.call(options, 'host')
    ? options.host
    : 'localhost';

  server.listen(port, host, (err) => {
    if (err && done) {
      return done(err);
    }

    if (done) {
      done();
    }
  });

  return {
    server,
    compiler,
  };
}

function startAwaitingCompilationFullSetup(config, options, done) {
  let readyCount = 0;
  let err;
  const ready = (e) => {
    err = e instanceof Error || (typeof e === 'object' && e.code) ? e : err;
    readyCount += 1;
    if (readyCount === 2) {
      done(err);
    }
  };

  const fullSetup = startFullSetup(config, options, ready);

  // wait for compilation, since dev server can start before this
  // https://github.com/webpack/webpack-dev-server/issues/847
  fullSetup.compiler.hooks.done.tap('done', ready);

  return fullSetup;
}

function startAwaitingCompilation(config, options, done) {
  return startAwaitingCompilationFullSetup(config, options, done).server;
}

function start(config, options, done) {
  // I suspect that almost all tests need to wait for compilation to
  // finish, because not doing so leaves open handles for jest,
  // in the case where a compilation didn't finish before destroying
  // the server and moving on. Thus, the default "start" should wait
  // for compilation, and only special cases where you don't expect
  // a compilation happen should use startBeforeCompilation
  return startAwaitingCompilation(config, options, done);
}

function startBeforeCompilation(config, options, done) {
  return startFullSetup(config, options, done).server;
}

function close(done) {
  if (server) {
    server.close(() => {
      server = null;
      done();
    });
  } else {
    done();
  }
}

module.exports = {
  startFullSetup,
  startAwaitingCompilation,
  startAwaitingCompilationFullSetup,
  startBeforeCompilation,
  start,
  close,
};
