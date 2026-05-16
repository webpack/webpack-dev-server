/** @typedef {import("../Server.js").ClientConnection} ClientConnection */
export default class BaseServer {
  /**
   * @param {import("../Server.js").default} server server
   */
  constructor(server: import("../Server.js").default);
  /** @type {import("../Server.js").default} */
  server: import("../Server.js").default;
  /** @type {ClientConnection[]} */
  clients: ClientConnection[];
}
export type ClientConnection = import("../Server.js").ClientConnection;
