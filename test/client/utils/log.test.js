"use strict";

require("../../helpers/jsdom-setup");

const { afterEach, beforeEach, describe, it, mock } = require("node:test");
const { expect } = require("expect");
const { fn } = require("jest-mock");

describe("'log' function", () => {
  let logMock;
  let setLogLevel;
  let runtimeMock;

  beforeEach(() => {
    logMock = {
      getLogger: fn(),
      configureDefaultLogger: fn(),
    };
    runtimeMock = mock.module("webpack/lib/logging/runtime.js", {
      defaultExport: logMock,
      namedExports: logMock,
    });

    setLogLevel = require("../../../client-src/utils/log").setLogLevel;
  });

  afterEach(() => {
    logMock.getLogger.mockClear();
    logMock.configureDefaultLogger.mockClear();
    runtimeMock.restore();
    delete require.cache[require.resolve("../../../client-src/utils/log")];
  });

  it("should set info as the default level and create logger", () => {
    const { getLogger } = logMock;
    const { configureDefaultLogger } = logMock;

    expect(configureDefaultLogger).toHaveBeenCalled();
    expect(configureDefaultLogger.mock.calls[0][0]).toEqual({
      level: "info",
    });

    expect(getLogger).toHaveBeenCalled();
    expect(getLogger.mock.calls[0][0]).toBe("webpack-dev-server");
  });

  it("should set log level via setLogLevel", (t) => {
    for (const level of ["none", "error", "warn", "info", "log", "verbose"]) {
      setLogLevel(level);
    }

    t.assert.snapshot(logMock.configureDefaultLogger.mock.calls);
  });
});
