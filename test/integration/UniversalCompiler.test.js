"use strict";

const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/universal-compiler-config/webpack.config");
const port = require("../ports-map")["universal-compiler"];

describe("universal compiler", () => {
  let server;
  let req;

  beforeAll(async () => {
    const compiler = webpack(config);

    server = new Server({ port }, compiler);

    await server.start();

    req = request(server.app);
  });

  afterAll(async () => {
    await server.stop();
  });

  it("client bundle should have the inlined the client runtime", async () => {
    const response = await req.get("/client.js");

    expect(response.headers["content-type"]).toEqual(
      "application/javascript; charset=utf-8"
    );
    expect(response.status).toEqual(200);
    expect(response.text).toContain("Hello from the client");
    expect(response.text).toContain("WebsocketClient");
  });

  it("server bundle should NOT have the inlined the client runtime", async () => {
    // we wouldn't normally request a server bundle
    // but we'll do it here to check the contents
    const response = await req.get("/server.js");

    expect(response.headers["content-type"]).toEqual(
      "application/javascript; charset=utf-8"
    );
    expect(response.status).toEqual(200);
    expect(response.text).toContain("Hello from the server");
    expect(response.text).not.toContain("WebsocketClient");
  });
});
