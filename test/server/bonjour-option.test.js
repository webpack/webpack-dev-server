"use strict";

const os = require("os");
const config = require("../fixtures/simple-config/webpack.config");
const testServer = require("../helpers/test-server");
const port = require("../ports-map").bonjour;

describe("bonjour option", () => {
  let server;
  const mockPublish = jest.fn();
  const mockUnpublishAll = jest.fn();

  beforeAll(() => {
    jest.mock("bonjour", () => () => {
      return {
        publish: mockPublish,
        unpublishAll: mockUnpublishAll,
      };
    });
  });

  afterEach(() => {
    mockPublish.mockReset();
    mockUnpublishAll.mockReset();
  });

  describe("http", () => {
    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          bonjour: true,
          port,
        },
        done
      );
    });

    afterEach((done) => {
      server.close(done);
    });

    it("should call bonjour with correct params", () => {
      expect(mockPublish).toHaveBeenCalledTimes(1);
      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "http",
        subtypes: ["webpack"],
      });
      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
    });
  });

  describe("https option", () => {
    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          bonjour: true,
          port,
          https: true,
        },
        done
      );
    });

    afterEach((done) => {
      server.close(done);
    });

    it("bonjour should use https when passed in option", () => {
      expect(mockPublish).toHaveBeenCalledTimes(1);
      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "https",
        subtypes: ["webpack"],
      });
      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
    });
  });

  describe("bonjour object", () => {
    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          bonjour: {
            type: "https",
            protocol: "udp",
          },
          port,
        },
        done
      );
    });

    afterEach((done) => {
      server.close(done);
    });

    it("applies bonjour options", () => {
      expect(mockPublish).toHaveBeenCalledTimes(1);
      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "https",
        protocol: "udp",
        subtypes: ["webpack"],
      });
      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
    });
  });

  describe("bonjour object and https", () => {
    beforeEach((done) => {
      server = testServer.start(
        config,
        {
          bonjour: {
            type: "http",
            protocol: "udp",
          },
          https: true,
          port,
        },
        done
      );
    });

    afterEach((done) => {
      server.close(done);
    });

    it("prefers bonjour options over devServer.https", () => {
      expect(mockPublish).toHaveBeenCalledTimes(1);
      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "http",
        protocol: "udp",
        subtypes: ["webpack"],
      });
      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
    });
  });
});
