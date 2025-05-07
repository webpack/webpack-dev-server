"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");

describe("isSameOrigin", () => {
  let server;

  beforeEach(async () => {
    const compiler = webpack(config);
    server = new Server({}, compiler);
  });

  it("should return true for localhost", () => {
    const headers = {
      host: "localhost:8080",
      origin: "http://localhost:8080",
    };

    expect(server.isSameOrigin(headers)).toBe(true);
  });

  it("should return true for localhost subdomains", () => {
    const headers = {
      host: "localhost:8080",
      origin: "http://subdomain.localhost:8080",
    };

    expect(server.isSameOrigin(headers)).toBe(true);
  });

  it("should return false for cross-origin requests", () => {
    const headers = {
      origin: "http://example.com",
      host: "attacker.com",
    };

    expect(server.isSameOrigin(headers)).toBe(false);
  });
});
