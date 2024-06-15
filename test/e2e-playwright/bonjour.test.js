"use strict";

const os = require("os");
const webpack = require("webpack");
const { test } = require("@playwright/test");
const { expect } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { beforeEach, afterEach } = require("@playwright/test");
// const { jest } = require("@jest/globals");
const jestMock = require("jest-mock");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map").bonjour;

describe("bonjour option", () => {
  let mockPublish;
  let mockUnpublishAll;
  let mockDestroy;

  beforeEach(() => {
    mockPublish = jestMock.fn();
    mockUnpublishAll = jestMock.fn((callback) => {
      callback();
    });
    mockDestroy = jestMock.fn();
  });

  describe("as true", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      jest.mock("bonjour-service", () => {
        return {
          Bonjour: jestMock.fn().mockImplementation(() => {
            return {
              publish: mockPublish,
              unpublishAll: mockUnpublishAll,
              destroy: mockDestroy,
            };
          }),
        };
      });

      compiler = webpack(config);

      server = new Server({ port, bonjour: true }, compiler);

      await server.start();

      pageErrors = [];
      consoleMessages = [];
    });

    afterEach(async () => {
      await server.stop();

      mockPublish.mockReset();
      mockUnpublishAll.mockReset();
      mockDestroy.mockReset();
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

      expect(mockPublish).toHaveBeenCalledTimes(1);

      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "http",
        subtypes: ["webpack"],
      });

      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
      expect(mockDestroy).toHaveBeenCalledTimes(0);

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("with 'server' option", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      jestMock.mock("bonjour-service", () => {
        return {
          Bonjour: jestMock.fn().mockImplementation(() => {
            return {
              publish: mockPublish,
              unpublishAll: mockUnpublishAll,
              destroy: mockDestroy,
            };
          }),
        };
      });

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

      expect(mockPublish).toHaveBeenCalledTimes(1);

      expect(mockPublish).toHaveBeenCalledWith({
        name: `Webpack Dev Server ${os.hostname()}:${port}`,
        port,
        type: "https",
        subtypes: ["webpack"],
      });

      expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
      expect(mockDestroy).toHaveBeenCalledTimes(0);

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("as object", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      jest.mock("bonjour-service", () => {
        return {
          Bonjour: jestMock.fn().mockImplementation(() => {
            return {
              publish: mockPublish,
              unpublishAll: mockUnpublishAll,
              destroy: mockDestroy,
            };
          }),
        };
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });

  describe("bonjour object and 'server' option", () => {
    let compiler;
    let server;
    let pageErrors;
    let consoleMessages;

    beforeEach(async () => {
      jest.mock("bonjour-service", () => {
        return {
          Bonjour: jestMock.fn().mockImplementation(() => {
            return {
              publish: mockPublish,
              unpublishAll: mockUnpublishAll,
              destroy: mockDestroy,
            };
          }),
        };
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

      expect(JSON.stringify(response.status())).toMatchSnapshot();

      expect(JSON.stringify(consoleMessages.map((message) => message.text()))).toMatchSnapshot();

      expect(JSON.stringify(pageErrors)).toMatchSnapshot();
    });
  });
});
