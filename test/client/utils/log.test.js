/**
 * @jest-environment jsdom
 */

"use strict";

describe("'log' function", () => {
  let logMock;
  let setLogLevel;

  beforeEach(() => {
    jest.setMock("webpack/lib/logging/runtime", {
      getLogger: jest.fn(),
      configureDefaultLogger: jest.fn(),
    });
    logMock = require("webpack/lib/logging/runtime");

    setLogLevel = require("../../../client-src/utils/log").setLogLevel;
  });

  afterEach(() => {
    logMock.getLogger.mockClear();
    logMock.configureDefaultLogger.mockClear();
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

  it("should set log level via setLogLevel", () => {
    for (const level of ["none", "error", "warn", "info", "log", "verbose"]) {
      setLogLevel(level);
    }

    expect(logMock.configureDefaultLogger.mock.calls).toMatchSnapshot();
  });
});
