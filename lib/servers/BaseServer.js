/** @typedef {import("../Server.js").ClientConnection} ClientConnection */

// base class that users should extend if they are making their own
// server implementation
export default class BaseServer {
  /**
   * @param {import("../Server.js").default} server server
   */
  constructor(server) {
    /** @type {import("../Server.js").default} */
    this.server = server;

    /** @type {ClientConnection[]} */
    this.clients = [];
  }
}
