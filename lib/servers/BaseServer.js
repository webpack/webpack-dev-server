'use strict';

// base class that users should extend if they are making their own
// server implementation
module.exports = class BaseServer {
  constructor(server, compiler) {
    this.server = server;
    this.compiler = compiler;
  }
};
