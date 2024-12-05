/**
 * @jest-environment jsdom
 */

"use strict";

describe("index", () => {
  let log;
  let socket;
  let overlay;
  let sendMessage;
  let onSocketMessage;
  const locationValue = self.location;
  const resourceQueryValue = global.__resourceQuery;

  beforeEach(() => {
    global.__resourceQuery = "?mock-url";
    global.__webpack_hash__ = "mock-hash";

    // log
    jest.setMock("../../client-src/utils/log.js", {
      log: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      logEnabledFeatures: jest.fn(),
      setLogLevel: jest.fn(),
    });

    log = require("../../client-src/utils/log");

    // socket
    jest.setMock("../../client-src/socket.js", jest.fn());
    socket = require("../../client-src/socket");

    const send = jest.fn();

    // overlay
    jest.setMock("../../client-src/overlay.js", {
      createOverlay: () => {
        return {
          send,
        };
      },
      formatProblem: (item) => {
        return { header: "HEADER warning", body: `BODY: ${item}` };
      },
    });
    const { createOverlay } = require("../../client-src/overlay");
    overlay = createOverlay();

    // sendMessage
    jest.setMock("../../client-src/utils/sendMessage.js", jest.fn());
    sendMessage = require("../../client-src/utils/sendMessage");

    // issue: https://github.com/jsdom/jsdom/issues/2112
    delete window.location;

    window.location = { ...locationValue, reload: jest.fn() };

    require("../../client-src");
    onSocketMessage = socket.mock.calls[0][1];
  });

  afterEach(() => {
    global.__resourceQuery = resourceQueryValue;
    Object.assign(self, locationValue);
    jest.resetAllMocks();
    jest.resetModules();
  });

  test("should set arguments into socket function", () => {
    expect(socket.mock.calls[0]).toMatchSnapshot();
  });

  test("should run onSocketMessage['still-ok']", () => {
    onSocketMessage["still-ok"]();

    expect(log.log.info.mock.calls[1][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
    expect(overlay.send).not.toBeCalledWith({ type: "DISMISS" });

    // change flags
    onSocketMessage.overlay(true);
    onSocketMessage["still-ok"]();

    expect(overlay.send).toHaveBeenCalledWith({ type: "DISMISS" });
  });

  test("should run onSocketMessage.progress and onSocketMessage['progress-update']", () => {
    onSocketMessage.progress(false);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
    });

    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();

    onSocketMessage.progress(true);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
    });

    expect(log.log.info.mock.calls[1][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.progress and onSocketMessage['progress-update'] and log plugin name", () => {
    onSocketMessage.progress(false);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
      pluginName: "mock-plugin",
    });

    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();

    onSocketMessage.progress(true);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
      pluginName: "mock-plugin",
    });

    expect(log.log.info.mock.calls[1][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.ok", () => {
    onSocketMessage.ok();

    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();

    onSocketMessage.errors([]);
    onSocketMessage.hash("mock-hash");

    const res = onSocketMessage.ok();

    // eslint-disable-next-line no-undefined
    expect(res).toEqual(undefined);
  });

  test("should run onSocketMessage['static-changed']", () => {
    onSocketMessage["static-changed"]();

    expect(log.log.info.mock.calls[1][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test("should run onSocketMessage['static-changed'](file)", () => {
    onSocketMessage["static-changed"]("/static/assets/index.html");

    expect(log.log.info.mock.calls[1][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test("should run onSocketMessage.warnings", () => {
    onSocketMessage.warnings(["warn1", "\u001B[4mwarn2\u001B[0m", "warn3"]);

    expect(log.log.warn.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
    expect(log.log.warn.mock.calls.splice(1)).toMatchSnapshot();

    // change flags
    onSocketMessage.overlay({ warnings: true });
    onSocketMessage.warnings(["warning message"]);

    expect(overlay.send).toHaveBeenCalledTimes(1);
    expect(overlay.send).toHaveBeenCalledWith({
      type: "BUILD_ERROR",
      level: "warning",
      messages: ["warning message"],
    });
  });

  test("should parse overlay options from resource query", () => {
    jest.isolateModules(() => {
      // Pass JSON config with warnings disabled
      global.__resourceQuery = `?overlay=${encodeURIComponent(
        `{"warnings": false}`,
      )}`;
      overlay.send.mockReset();
      socket.mockReset();
      require("../../client-src");
      onSocketMessage = socket.mock.calls[0][1];

      onSocketMessage.warnings(["warn1"]);
      expect(overlay.send).not.toBeCalled();

      onSocketMessage.errors(["error1"]);
      expect(overlay.send).toBeCalledTimes(1);
      expect(overlay.send).toHaveBeenCalledWith({
        type: "BUILD_ERROR",
        level: "error",
        messages: ["error1"],
      });
    });

    jest.isolateModules(() => {
      // Pass JSON config with errors disabled
      global.__resourceQuery = `?overlay=${encodeURIComponent(
        `{"errors": false}`,
      )}`;
      overlay.send.mockReset();
      socket.mockReset();
      require("../../client-src");
      onSocketMessage = socket.mock.calls[0][1];

      onSocketMessage.errors(["error1"]);
      expect(overlay.send).not.toBeCalled();

      onSocketMessage.warnings(["warn1"]);
      expect(overlay.send).toBeCalledTimes(1);
      expect(overlay.send).toHaveBeenCalledWith({
        type: "BUILD_ERROR",
        level: "warning",
        messages: ["warn1"],
      });
    });

    jest.isolateModules(() => {
      // Use simple boolean
      global.__resourceQuery = "?overlay=true";
      socket.mockReset();
      overlay.send.mockReset();
      require("../../client-src");
      onSocketMessage = socket.mock.calls[0][1];

      onSocketMessage.warnings(["warn2"]);
      expect(overlay.send).toBeCalledTimes(1);
      expect(overlay.send).toHaveBeenLastCalledWith({
        type: "BUILD_ERROR",
        level: "warning",
        messages: ["warn2"],
      });

      onSocketMessage.errors(["error2"]);
      expect(overlay.send).toBeCalledTimes(2);
      expect(overlay.send).toHaveBeenLastCalledWith({
        type: "BUILD_ERROR",
        level: "error",
        messages: ["error2"],
      });
    });
  });

  test("should run onSocketMessage.error", () => {
    onSocketMessage.error("error!!");

    expect(log.log.error.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.close", () => {
    onSocketMessage.close();

    expect(log.log.info.mock.calls[1][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.close (hot enabled)", () => {
    // enabling hot
    onSocketMessage.hot();
    onSocketMessage.close();

    expect(log.log.info.mock.calls[1][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.close (liveReload enabled)", () => {
    // enabling liveReload
    onSocketMessage.liveReload();
    onSocketMessage.close();

    expect(log.log.info.mock.calls[1][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });
});
