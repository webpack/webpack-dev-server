"use strict";

require("../../helpers/jsdom-setup");

const http = require("node:http");
const { after, before, describe, it } = require("node:test");
const { expect } = require("expect");
const express = require("express");
const { spyOn } = require("jest-mock");
const ws = require("ws");

const WebSocketClient =
  require("../../../client-src/clients/WebSocketClient").default;
const { log } = require("../../../client-src/utils/log");
const port = require("../../ports-map")["web-socket-client"];

describe("WebsocketClient", () => {
  let socketServer;
  let server;
  let logErrorSpy;

  before(
    () =>
      new Promise((resolve) => {
        // eslint-disable-next-line new-cap
        const app = new express();

        server = http.createServer(app);
        server.listen(port, "localhost", () => {
          socketServer = new ws.Server({
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
        logErrorSpy.mockRestore();
        server.close(() => {
          resolve();
        });
      }),
  );

  describe("client", () => {
    it("should open, receive message, and close", async (t) => {
      logErrorSpy = spyOn(log, "error").mockImplementation();

      socketServer.on("connection", (connection) => {
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

      const testError = new Error("test");

      client.client.onerror(testError);

      expect(log.error.mock.calls).toHaveLength(1);
      expect(log.error.mock.calls[0]).toEqual([testError]);

      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });

      t.assert.snapshot(data);
    });
  });
});
