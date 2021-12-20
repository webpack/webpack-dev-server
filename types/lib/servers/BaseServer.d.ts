export = BaseServer;
declare class BaseServer {
  /**
   * @param {any} server
   */
  constructor(server: any);
  /**
   * @param {any} server
   */
  server: any;
  /** @type {ClientConnection[]} */
  clients: ClientConnection[];
}
declare namespace BaseServer {
  export { ClientConnection };
}
type ClientConnection = import("../Server").ClientConnection;
