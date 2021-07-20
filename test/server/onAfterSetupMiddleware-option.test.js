"use strict";

const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["on-after-setup-middleware-option"];

describe("onAfterSetupMiddleware option", () => {
  let server;
  let req;

  beforeAll(async () => {
    const compiler = webpack(config);

    server = new Server(
      {
        onAfterSetupMiddleware: (self) => {
          if (!self.app) {
            throw new Error("app is not defined");
          }

          if (!self.compiler) {
            throw new Error("compiler is not defined");
          }

          self.app.get("/after/some/path", (_, response) => {
            response.send("after");
          });

          self.app.post("/after/some/path", (_, response) => {
            response.send("after POST");
          });
        },
        port,
      },
      compiler
    );

    await new Promise((resolve, reject) => {
      server.listen(port, "127.0.0.1", (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    req = request(server.app);
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  it("should handle after route", async () => {
    const response = await req.get("/after/some/path");

    expect(response.headers["content-type"]).toEqual(
      "text/html; charset=utf-8"
    );
    expect(response.status).toEqual(200);
    expect(response.text).toBe("after");
  });

  it("should handle POST requests to after route", async () => {
    const response = await req.post("/after/some/path");

    expect(response.headers["content-type"]).toEqual(
      "text/html; charset=utf-8"
    );
    expect(response.status).toEqual(200);
    expect(response.text).toBe("after POST");
  });
});
