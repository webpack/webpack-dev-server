"use strict";

const os = require("node:os");
const { afterEach, beforeEach, describe, it, mock } = require("node:test");
const { expect } = require("expect");
const { fn } = require("jest-mock");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").bonjour;

describe("bonjour option", () => {
  let mockPublish;
  let mockUnpublishAll;
  let mockDestroy;

  beforeEach(() => {
    mockPublish = fn();
    mockUnpublishAll = fn((callback) => {
      callback();
    });
    mockDestroy = fn();
  });

  describe("as true", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let bonjourMock;

    beforeEach(async () => {
      bonjourMock = mock.module("bonjour-service", {
        namedExports: {
          Bonjour: fn().mockImplementation(() => ({
            publish: mockPublish,
            unpublishAll: mockUnpublishAll,
            destroy: mockDestroy,
          })),
        },
      });

      compiler = webpack(config);

      server = new Server({ port, bonjour: true }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();

      mockPublish.mockReset();
      mockUnpublishAll.mockReset();
      mockDestroy.mockReset();
      bonjourMock.restore();
    });

    it("should call bonjour with correct params", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(mockPublish).toHaveBeenCalledTimes(1);

      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "http",
        subtypes: ["webpack"],
      });

      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
      expect(mockDestroy).toHaveBeenCalledTimes(0);

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("with 'server' option", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let bonjourMock;

    beforeEach(async () => {
      bonjourMock = mock.module("bonjour-service", {
        namedExports: {
          Bonjour: fn().mockImplementation(() => ({
            publish: mockPublish,
            unpublishAll: mockUnpublishAll,
            destroy: mockDestroy,
          })),
        },
      });

      compiler = webpack(config);

      server = new Server({ bonjour: true, port, server: "https" }, compiler);

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      bonjourMock.restore();
    });

    it("should call bonjour with 'https' type", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`https://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(mockPublish).toHaveBeenCalledTimes(1);

      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "https",
        subtypes: ["webpack"],
      });

      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
      expect(mockDestroy).toHaveBeenCalledTimes(0);

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("as object", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let bonjourMock;

    beforeEach(async () => {
      bonjourMock = mock.module("bonjour-service", {
        namedExports: {
          Bonjour: fn().mockImplementation(() => ({
            publish: mockPublish,
            unpublishAll: mockUnpublishAll,
            destroy: mockDestroy,
          })),
        },
      });

      compiler = webpack(config);

      server = new Server(
        {
          port,
          bonjour: {
            type: "https",
            protocol: "udp",
          },
        },
        compiler,
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      bonjourMock.restore();
    });

    it("should apply bonjour options", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(mockPublish).toHaveBeenCalledTimes(1);

      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "https",
        protocol: "udp",
        subtypes: ["webpack"],
      });

      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
      expect(mockDestroy).toHaveBeenCalledTimes(0);

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });

  describe("bonjour object and 'server' option", () => {
    let compiler;
    let server;
    let page;
    let browser;
    let pageErrors;
    let consoleMessages;
    let bonjourMock;

    beforeEach(async () => {
      bonjourMock = mock.module("bonjour-service", {
        namedExports: {
          Bonjour: fn().mockImplementation(() => ({
            publish: mockPublish,
            unpublishAll: mockUnpublishAll,
            destroy: mockDestroy,
          })),
        },
      });

      compiler = webpack(config);

      server = new Server(
        {
          port,
          bonjour: {
            type: "http",
            protocol: "udp",
          },
          server: {
            type: "https",
          },
        },
        compiler,
      );

      await server.start();

      ({ page, browser } = await runBrowser());

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await browser.close();
      await server.stop();
      bonjourMock.restore();
    });

    it("should apply bonjour options", async (t) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`https://localhost:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(mockPublish).toHaveBeenCalledTimes(1);

      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "http",
        protocol: "udp",
        subtypes: ["webpack"],
      });

      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
      expect(mockDestroy).toHaveBeenCalledTimes(0);

      await t.test("response status", async (t) =>
        t.assert.snapshot(response.status()),
      );

      await t.test("console messages", async (t) =>
        t.assert.snapshot(consoleMessages.map((message) => message.text())),
      );

      await t.test("page errors", async (t) => t.assert.snapshot(pageErrors));
    });
  });
});
