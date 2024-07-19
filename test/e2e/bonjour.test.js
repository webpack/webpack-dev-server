"use strict";

const os = require("os");
const webpack = require("webpack");
const { describe, test, beforeEach, beforeAll, afterEach } = require("@playwright/test");
const sinon = require("sinon");
const bonjourService = require("bonjour-service");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map").bonjour;

describe("bonjour option", { tag: "@flaky" }, () => {
  let mockPublish;
  let mockUnpublishAll;
  let mockDestroy;

  beforeAll(() => {
    mockPublish = sinon.stub();
    mockUnpublishAll = sinon.stub().callsFake((callback) => {
      callback();
    });
    mockDestroy = sinon.stub();

    sinon.stub(bonjourService, 'Bonjour').returns({
      publish: mockPublish,
      unpublishAll: mockUnpublishAll,
      destroy: mockDestroy,
    })
  });

  afterEach(() => {
    mockPublish.resetHistory();
    mockUnpublishAll.resetHistory();
    mockDestroy.resetHistory();
  })

  describe("as true", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server({ port, bonjour: true }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should call bonjour with correct params", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(mockPublish.callCount).toBe(1);

      expect(mockPublish.calledWith(
        {
          name: `Webpack Dev Server ${os.hostname()}:${port}`,
          port,
          type: "http",
          subtypes: ["webpack"],
        }
      )).toBeTruthy();

      expect(mockUnpublishAll.callCount).toBe(0);
      expect(mockDestroy.callCount).toBe(0);

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("with 'server' option", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      compiler = webpack(config);

      server = new Server({ bonjour: true, port, server: "https" }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should call bonjour with 'https' type", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`https://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(mockPublish.callCount).toBe(1);

      expect(mockPublish.calledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "https",
        subtypes: ["webpack"],
      })).toBeTruthy();

      expect(mockUnpublishAll.callCount).toBe(0);
      expect(mockDestroy.callCount).toBe(0);

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("as object", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should apply bonjour options", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(mockPublish.callCount).toBe(1);

      expect(mockPublish.calledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "https",
        protocol: "udp",
        subtypes: ["webpack"],
      })).toBeTruthy();

      expect(mockUnpublishAll.callCount).toBe(0);
      expect(mockDestroy.callCount).toBe(0);

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });

  describe("bonjour object and 'server' option", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
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

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();
    });

    test("should apply bonjour options", async ({ page }) => {
      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      const response = await page.goto(`https://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(mockPublish.callCount).toBe(1);

      expect(mockPublish.calledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "http",
        protocol: "udp",
        subtypes: ["webpack"],
      })).toBeTruthy();

      expect(mockUnpublishAll.callCount).toBe(0);
      expect(mockDestroy.callCount).toBe(0);

      expect(response.status()).toMatchSnapshotWithArray();

      expect(
        consoleMessages.map((message) => message.text()))
      .toMatchSnapshotWithArray();

      expect(pageErrors).toMatchSnapshotWithArray();
    });
  });
});
