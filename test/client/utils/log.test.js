import "../../helpers/jsdom-setup.js";

import { afterEach, beforeEach, describe, it, mock } from "node:test";
import { expect } from "expect";
import { fn } from "jest-mock";

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
    // mocking the file log.js actually imports does.
    loggerMockCtx = mock.module("../../../client-src/modules/logger/index.js", {
      defaultExport: logger,
    });
  });

  afterEach(() => {
    loggerMockCtx.restore();
  });

  /**
   * Force a fresh evaluation of log.js so the mocked logger is observed.
   * @returns {Promise<typeof import("../../../client-src/utils/log")>} the freshly evaluated log module
   */
  function freshLogModule() {
    const url = import.meta.resolve("../../../client-src/utils/log.js");
    return import(`${url}?t=${Date.now()}-${Math.random()}`);
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
