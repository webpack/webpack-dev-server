/** @typedef {import("../Server.js").WebSocketServerConfiguration} WebSocketServerConfiguration */
/** @typedef {import("../Server.js").ClientConnection} ClientConnection */
export default class WebsocketServer extends BaseServer {
  static heartbeatInterval: number;
  implementation: import("ws").Server<
    typeof import("ws").default,
    typeof import("http").IncomingMessage
  >;
}
export type WebSocketServerConfiguration =
  import("../Server.js").WebSocketServerConfiguration;
export type ClientConnection = import("../Server.js").ClientConnection;
import BaseServer from "./BaseServer.js";
