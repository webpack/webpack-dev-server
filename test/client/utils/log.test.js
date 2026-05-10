"use strict";

require("../../helpers/jsdom-setup");

const { describe, it } = require("node:test");
const { expect } = require("expect");
const { fn } = require("jest-mock");

const { log, setLogLevel } = require("../../../client-src/utils/log");

describe("'log' function", () => {
  it("exports a logger instance bound at module load", () => {
    expect(log).toBeDefined();
    expect(typeof log).toBe("object");
  });

  it("setLogLevel forwards { level } to the logger when given default", () => {
    const logger = {
      getLogger: fn(),
      configureDefaultLogger: fn(),
    };

    setLogLevel("info", logger);

    expect(logger.configureDefaultLogger).toHaveBeenCalledWith({
      level: "info",
    });
  });

  it("should set log level via setLogLevel", (t) => {
    const logger = {
      getLogger: fn(),
      configureDefaultLogger: fn(),
    };

    for (const level of ["none", "error", "warn", "info", "log", "verbose"]) {
      setLogLevel(level, logger);
    }

    t.assert.snapshot(logger.configureDefaultLogger.mock.calls);
  });
});
