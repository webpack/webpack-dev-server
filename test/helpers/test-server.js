"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");

/** @typedef {import("webpack").Configuration} Configuration */
/** @typedef {import("../../lib/Server").Configuration} DevServerConfiguration */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").MultiCompiler} MultiCompiler */

let server;

// start server, returning the full setup of the server
// (both the server and the compiler)

/**
 * @param {Configuration} config configuration
 * @param {DevServerConfiguration} devServerConfig dev server configuration
 * @param {(err?: Error) => void=} done done callback
 * @returns {{ server: Server, compiler: Compiler | MultiCompiler }} server and compiler
 */
function startFullSetup(config, devServerConfig, done) {
  // disable watching by default for tests
  if (typeof devServerConfig.static === "undefined") {
    devServerConfig.static = false;
  } else if (devServerConfig.static === null) {
    // this provides a way of using the default static value
    delete devServerConfig.static;
  }

  const compiler = webpack(config);

  server = new Server(devServerConfig, compiler);

  server.startCallback((error) => {
    if (error && done) {
      return done(error);
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

/**
 * @param {Configuration} config configuration
 * @param {DevServerConfiguration} devServerConfig dev server configuration
 * @param {(err?: Error) => void=} done done callback
 * @returns {{ server: Server, compiler: Compiler | MultiCompiler }} server and compiler
 */
function start(config, devServerConfig, done) {
  let readyCount = 0;

  const ready = (error) => {
    if (error && done) {
      done(error);

      return;
    }

    readyCount += 1;

    if (readyCount === 2) {
      done();
    }
  };

  const fullSetup = startFullSetup(config, devServerConfig, ready);

  // wait for compilation, since dev server can start before this
  // https://github.com/webpack/webpack-dev-server/issues/847
  fullSetup.compiler.hooks.done.tap("done", () => {
    ready();
  });

  return fullSetup;
}

/**
 * @param {() => void} done done callback
 */
function close(done) {
  if (server) {
    server.stopCallback(() => {
      server = null;
      done();
    });
  } else {
    done();
  }
}

module.exports = {
  close,
  start,
};
