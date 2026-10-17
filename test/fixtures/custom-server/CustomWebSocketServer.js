import { WebSocketServer } from "ws";
import BaseServer from "../../../lib/servers/BaseServer.js";

// A `webSocketServer` implementation of someone else's, the shape this server
// has documented since v4: a class extending `BaseServer`, constructed with
// the server, with an `implementation` that emits `connection` and a
// `clients` array. It answers upgrades on this server's own HTTP server.
export default class CustomWebSocketServer extends BaseServer {
  /**
   * @param {import("../../../lib/Server.js").default} server server
   */
  constructor(server) {
    super(server);

    const { path = "/ws" } = this.server.options.webSocketServer.options || {};

    this.implementation = new WebSocketServer({
      noServer: true,
      path,
      clientTracking: false,
    });

    const httpServer = this.server.server;
    const onUpgrade = (req, socket, head) => {
      if (!this.implementation.shouldHandle(req)) {
        return;
      }

      this.implementation.handleUpgrade(req, socket, head, (client) => {
        this.implementation.emit("connection", client, req);
      });
    };

    httpServer.on("upgrade", onUpgrade);

    this.implementation.on("connection", (client) => {
      this.clients.push(client);

      client.on("close", () => {
        this.clients.splice(this.clients.indexOf(client), 1);
      });
    });

    this.implementation.on("close", () => {
      httpServer.removeListener("upgrade", onUpgrade);
    });
  }
}
