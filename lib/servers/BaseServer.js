"use strict";

// base class that users should extend if they are making their own
// server implementation
module.exports = class BaseServer {
  /**
   * @param {typeof import("../Server")} server
   */
  constructor(server) {
    this.server = server;
    this.clients = [];
  }
};
