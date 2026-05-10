"use strict";

require("../../helpers/jsdom-setup");

const { afterEach, beforeEach, describe, it, mock } = require("node:test");
const { expect } = require("expect");
const { fn } = require("jest-mock");

describe("'log' function", () => {
  let logger;
  let loggerMockCtx;

  beforeEach(() => {
    logger = {
      getLogger: fn(),
      configureDefaultLogger: fn(),
    };
    // Mock the intermediate module that log.js imports directly. Mocking the
    // deeper webpack runtime through the re-export chain doesn't propagate;
    // mocking the file log.js actually requires does.
    loggerMockCtx = mock.module("../../../client-src/modules/logger/index.js", {
      defaultExport: logger,
    });
    for (const key of Object.keys(require.cache)) {
      if (key.includes("/client-src/")) delete require.cache[key];
    }
  });

  afterEach(() => {
    loggerMockCtx.restore();
    for (const key of Object.keys(require.cache)) {
      if (key.includes("/client-src/")) delete require.cache[key];
    }
  });

  /**
   * Force a fresh evaluation of log.js so the mocked logger is observed.
   * @returns {Promise<typeof import("../../../client-src/utils/log")>} the freshly evaluated log module
   */
  function freshLogModule() {
    const url = require.resolve("../../../client-src/utils/log");
    return import(`file://${url}?t=${Date.now()}-${Math.random()}`);
  }

  it("should set info as the default level and create logger", async () => {
    await freshLogModule();

    expect(logger.configureDefaultLogger).toHaveBeenCalledWith({
      level: "info",
    });
    expect(logger.getLogger).toHaveBeenCalledWith("webpack-dev-server");
  });

  it("should set log level via setLogLevel", async (t) => {
    const { setLogLevel } = await freshLogModule();

    // Drop the call recorded by the module-load setLogLevel(defaultLevel)
    // so the snapshot only reflects what this test triggers.
    logger.configureDefaultLogger.mockClear();

    for (const level of ["none", "error", "warn", "info", "log", "verbose"]) {
      setLogLevel(level);
    }

    t.assert.snapshot(logger.configureDefaultLogger.mock.calls);
  });
});
