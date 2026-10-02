import "../../helpers/jsdom-setup.js";

import http from "node:http";
import { after, before, describe, it } from "node:test";
import { expect } from "expect";
import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import WebSocketClient from "../../../client-src/clients/WebSocketClient.js";
import portsMap from "../../ports-map.js";

// jsdom's built-in WebSocket stays in CONNECTING for unreachable URLs (good
// for silencing other client tests) but doesn't fully drive open/close
// against a real local server. Use Node's `ws` library here so this test
// can talk to the express+ws server below. WebSocketClient only reads the
// global at construction time, so assigning after import is safe.
globalThis.WebSocket = WebSocket;

const port = portsMap["web-socket-client"];

// The transport itself comes from webpack-dev-middleware, which tests its own
// internals. What is this package's to check is that the module it points
// `client.webSocketTransport: "ws"` at really answers the contract the rest of
// the client is written against — against a real server, not a stub.
describe("WebsocketClient", () => {
  let socketServer;
  let server;

  before(
    () =>
      new Promise((resolve) => {
        // eslint-disable-next-line new-cap
        const app = new express();

        server = http.createServer(app);
        server.listen(port, "localhost", () => {
          socketServer = new WebSocketServer({
            server,
            path: "/ws-server",
          });
          resolve();
        });
      }),
  );

  after(
    () =>
      new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  );

  describe("client", () => {
    it("should open, receive message, and close", async (t) => {
      socketServer.once("connection", (connection) => {
        connection.send("hello world");

        setTimeout(() => {
          connection.close();
        }, 1000);
      });

      const client = new WebSocketClient(`ws://localhost:${port}/ws-server`);
      const data = [];

      client.onOpen(() => {
        data.push("open");
      });
      client.onClose(() => {
        data.push("close");
      });
      client.onMessage((msg) => {
        data.push(msg);
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });

      t.assert.snapshot(data);
    });

    it("should say nothing after it was closed", async () => {
      socketServer.once("connection", (connection) => {
        setTimeout(() => {
          connection.send("too late");
          connection.close();
        }, 500);
      });

      const client = new WebSocketClient(`ws://localhost:${port}/ws-server`);
      const data = [];

      client.onMessage((msg) => {
        data.push(msg);
      });
      client.onClose(() => {
        data.push("close");
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 200);
      });

      // Closing is how `socket.js` gives up, and a close it asked for must not
      // come back as one to reconnect from.
      client.close();

      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });

      expect(data).toEqual([]);
    });
  });
});
