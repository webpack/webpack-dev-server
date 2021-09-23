"use strict";

const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["client-option"];

describe("client option", () => {
  let server;
  let req;

  describe("default behavior", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          client: {
            webSocketTransport: "sockjs",
          },
          webSocketServer: "sockjs",
          port,
        },
        compiler
      );

      await server.start();

      req = request(`http://localhost:${port}`);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("overlay true by default", () => {
      expect(server.options.client.overlay).toBe(true);
    });

    it("responds with a 200", async () => {
      const response = await req.get("/ws");

      expect(response.statusCode).toEqual(200);
    });
  });

  describe("path option", () => {
    const path = "/foo/test/bar";

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          client: {
            webSocketTransport: "sockjs",
          },
          webSocketServer: {
            type: "sockjs",
            options: {
              host: "localhost",
              port,
              path: "/foo/test/bar",
            },
          },
          port,
        },
        compiler
      );

      await server.start();

      req = request(`http://localhost:${port}`);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("responds with a 200 second", async () => {
      const response = await req.get(path);

      expect(response.statusCode).toEqual(200);
    });
  });

  describe("configure client entry", () => {
    it("disables client entry", async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          client: false,
          port,
        },
        compiler
      );

      await server.start();

      const res = await request(server.app).get("/main.js");

      expect(res.text).not.toMatch(/client\/index\.js/);

      await server.stop();
    });
  });

  describe("webSocketTransport", () => {
    const clientModes = [
      {
        title: 'as a string ("sockjs")',
        client: {
          webSocketTransport: "sockjs",
        },
        webSocketServer: "sockjs",
        shouldThrow: false,
      },
      {
        title: 'as a path ("sockjs")',
        client: {
          webSocketTransport: require.resolve(
            "../../client-src/clients/SockJSClient"
          ),
        },
        webSocketServer: "sockjs",
        shouldThrow: false,
      },
      {
        title: "as a nonexistent path",
        client: {
          webSocketTransport: "/bad/path/to/implementation",
        },
        webSocketServer: "sockjs",
        shouldThrow: true,
      },
    ];

    describe("passed to server", () => {
      clientModes.forEach((data) => {
        it(`${data.title} ${
          data.shouldThrow ? "should throw" : "should not throw"
        }`, async () => {
          const compiler = webpack(config);

          server = new Server(
            {
              client: data.client,
              port,
            },
            compiler
          );

          let thrownError;

          try {
            await server.start();
          } catch (error) {
            thrownError = error;
          }

          if (data.shouldThrow) {
            expect(thrownError.message).toMatch(
              /client\.webSocketTransport must be a string/
            );
          }

          await server.stop();
        });
      });
    });
  });
});
