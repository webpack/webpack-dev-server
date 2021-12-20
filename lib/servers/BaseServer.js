"use strict";

/** @typedef {import("../Server").ClientConnection} ClientConnection */

// base class that users should extend if they are making their own
// server implementation
module.exports = class BaseServer {
  /**
   * @param {any} server
   */
  constructor(server) {
    /**
     * @param {any} server
     */
    this.server = server;

    /** @type {ClientConnection[]} */
    this.clients = [];
  }
};
