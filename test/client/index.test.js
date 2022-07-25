/**
 * @jest-environment jsdom
 */

"use strict";

describe("index", () => {
  let log;
  let socket;
  let overlay;
  let reloadApp;
  let sendMessage;
  let onSocketMessage;
  const locationValue = self.location;
  const resourceQueryValue = global.__resourceQuery;

  beforeEach(() => {
    global.__resourceQuery = "foo";
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

    // overlay
    jest.setMock("../../client-src/overlay.js", {
      hide: jest.fn(),
      show: jest.fn(),
      formatProblem: (item) => {
        return { header: "HEADER warning", body: `BODY: ${item}` };
      },
    });
    overlay = require("../../client-src/overlay");

    // reloadApp
    jest.setMock("../../client-src/utils/reloadApp.js", jest.fn());
    reloadApp = require("../../client-src/utils/reloadApp");

    // sendMessage
    jest.setMock("../../client-src/utils/sendMessage.js", jest.fn());
    sendMessage = require("../../client-src/utils/sendMessage");

    // getUrlOptions
    jest.setMock("../../client-src/utils/parseURL.js", () => {
      return {
        logging: "info",
        reconnect: 10,
      };
    });

    // createSocketUrl
    jest.setMock("../../client-src/utils/createSocketURL.js", () => "mock-url");

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

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
    expect(overlay.hide).not.toBeCalled();

    // change flags
    onSocketMessage.overlay(true);
    onSocketMessage["still-ok"]();

    expect(overlay.hide).toBeCalled();
  });

  test("should run onSocketMessage.progress and onSocketMessage['progress-update']", () => {
    onSocketMessage.progress(false);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
    });

    expect(log.log.info).not.toBeCalled();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();

    onSocketMessage.progress(true);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
    });

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.progress and onSocketMessage['progress-update'] and log plugin name", () => {
    onSocketMessage.progress(false);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
      pluginName: "mock-plugin",
    });

    expect(log.log.info).not.toBeCalled();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();

    onSocketMessage.progress(true);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
      pluginName: "mock-plugin",
    });

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.ok", () => {
    onSocketMessage.ok();

    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();

    onSocketMessage.errors([]);
    onSocketMessage.hash("mock-hash");

    const res = onSocketMessage.ok();

    expect(reloadApp).toBeCalled();
    expect(reloadApp.mock.calls[0][0]).toMatchSnapshot();
    // eslint-disable-next-line no-undefined
    expect(res).toEqual(undefined);
  });

  test("should run onSocketMessage['content-changed']", () => {
    onSocketMessage["content-changed"]();

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test("should run onSocketMessage['content-changed'](file)", () => {
    onSocketMessage["content-changed"]("/public/assets/index.html");

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test("should run onSocketMessage['static-changed']", () => {
    onSocketMessage["static-changed"]();

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test("should run onSocketMessage['static-changed'](file)", () => {
    onSocketMessage["static-changed"]("/static/assets/index.html");

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test("should run onSocketMessage.warnings", () => {
    onSocketMessage.warnings(["warn1", "\u001B[4mwarn2\u001B[0m", "warn3"]);

    expect(log.log.warn.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
    expect(log.log.warn.mock.calls.splice(1)).toMatchSnapshot();

    // change flags
    onSocketMessage.overlay({ warnings: true });
    onSocketMessage.warnings([]);

    expect(overlay.show).toBeCalled();
  });

  test("should parse overlay options from resource query", () => {
    jest.isolateModules(() => {
      // Pass JSON config with warnings disabled
      global.__resourceQuery = `?overlay=${encodeURIComponent(
        `{"warnings": false}`
      )}`;
      overlay.show.mockReset();
      socket.mockReset();
      jest.unmock("../../client-src/utils/parseURL.js");
      require("../../client-src");
      onSocketMessage = socket.mock.calls[0][1];

      onSocketMessage.warnings(["warn1"]);
      expect(overlay.show).not.toBeCalled();

      onSocketMessage.errors(["error1"]);
      expect(overlay.show).toBeCalledTimes(1);
    });

    jest.isolateModules(() => {
      // Pass JSON config with errors disabled
      global.__resourceQuery = `?overlay=${encodeURIComponent(
        `{"errors": false}`
      )}`;
      overlay.show.mockReset();
      socket.mockReset();
      jest.unmock("../../client-src/utils/parseURL.js");
      require("../../client-src");
      onSocketMessage = socket.mock.calls[0][1];

      onSocketMessage.errors(["error1"]);
      expect(overlay.show).not.toBeCalled();

      onSocketMessage.warnings(["warn1"]);
      expect(overlay.show).toBeCalledTimes(1);
    });

    jest.isolateModules(() => {
      // Use simple boolean
      global.__resourceQuery = "?overlay=true";
      jest.unmock("../../client-src/utils/parseURL.js");
      socket.mockReset();
      overlay.show.mockReset();
      require("../../client-src");
      onSocketMessage = socket.mock.calls[0][1];

      onSocketMessage.warnings(["warn2"]);
      expect(overlay.show).toBeCalledTimes(1);

      onSocketMessage.errors(["error2"]);
      expect(overlay.show).toBeCalledTimes(2);
    });
  });

  test("should run onSocketMessage.error", () => {
    onSocketMessage.error("error!!");

    expect(log.log.error.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.close", () => {
    onSocketMessage.close();

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.close (hot enabled)", () => {
    // enabling hot
    onSocketMessage.hot();
    onSocketMessage.close();

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.close (liveReload enabled)", () => {
    // enabling liveReload
    onSocketMessage.liveReload();
    onSocketMessage.close();

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should update log level if options is passed", () => {
    expect(log.setLogLevel.mock.calls[0][0]).toMatchSnapshot();
  });
});
