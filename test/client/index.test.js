import "../helpers/jsdom-setup.js";

import { afterEach, beforeEach, describe, it, mock } from "node:test";
import { expect } from "expect";
import { fn } from "jest-mock";

describe("index", () => {
  let log;
  let socket;
  let overlay;
  let sendMessage;
  let onSocketMessage;
  let logMockCtx;
  let socketMockCtx;
  let overlayMockCtx;
  let sendMessageMockCtx;
  const locationValue = self.location;
  const resourceQueryValue = globalThis.__resourceQuery;

  /**
   * Install fresh mock.module() interceptors for the four modules
   * client-src/index.js loads at evaluation time.
   * @returns {void}
   */
  function installMocks() {
    log = {
      log: { info: fn(), warn: fn(), error: fn() },
      logEnabledFeatures: fn(),
      setLogLevel: fn(),
    };
    logMockCtx = mock.module("../../client-src/utils/log.js", {
      namedExports: log,
    });

    socket = fn();
    socketMockCtx = mock.module("../../client-src/socket.js", {
      defaultExport: socket,
    });

    const send = fn();
    overlay = { send };
    overlayMockCtx = mock.module("../../client-src/overlay.js", {
      namedExports: {
        createOverlay: () => overlay,
        formatProblem: (item) => ({
          header: "HEADER warning",
          body: `BODY: ${item}`,
        }),
      },
    });

    sendMessage = fn();
    sendMessageMockCtx = mock.module("../../client-src/utils/sendMessage.js", {
      defaultExport: sendMessage,
    });
  }

  /**
   * Tear down the mock.module() interceptors installed by installMocks().
   * @returns {void}
   */
  function restoreMocks() {
    logMockCtx.restore();
    socketMockCtx.restore();
    overlayMockCtx.restore();
    sendMessageMockCtx.restore();
  }

  beforeEach(async () => {
    globalThis.__resourceQuery = "?mock-url";
    globalThis.__webpack_hash__ = "mock-hash";

    installMocks();

    // issue: https://github.com/jsdom/jsdom/issues/2112
    delete globalThis.location;
    globalThis.location = { ...locationValue, reload: fn() };

    // Use dynamic import with a cache-busting query string to force a fresh
    // module evaluation each test.
    const indexUrl = import.meta.resolve("../../client-src/index.js");
    await import(`${indexUrl}?t=${Date.now()}-${Math.random()}`);
    [[, onSocketMessage]] = socket.mock.calls;
  });

  afterEach(() => {
    globalThis.__resourceQuery = resourceQueryValue;
    Object.assign(globalThis, locationValue);
    restoreMocks();
  });

  it("should set arguments into socket function", (t) => {
    t.assert.snapshot(socket.mock.calls[0]);
  });

  it("should run onSocketMessage['still-ok']", (t) => {
    onSocketMessage["still-ok"]();

    t.assert.snapshot(log.log.info.mock.calls[1][0]);
    t.assert.snapshot(sendMessage.mock.calls[0][0]);
    expect(overlay.send).not.toHaveBeenCalledWith({ type: "DISMISS" });

    // change flags
    onSocketMessage.overlay(true);
    onSocketMessage["still-ok"]();

    expect(overlay.send).toHaveBeenCalledWith({ type: "DISMISS" });
  });

  it("should run onSocketMessage.progress and onSocketMessage['progress-update']", (t) => {
    onSocketMessage.progress(false);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
    });

    t.assert.snapshot(sendMessage.mock.calls[0][0]);

    onSocketMessage.progress(true);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
    });

    t.assert.snapshot(log.log.info.mock.calls[1][0]);
  });

  it("should run onSocketMessage.progress and onSocketMessage['progress-update'] and log plugin name", (t) => {
    onSocketMessage.progress(false);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
      pluginName: "mock-plugin",
    });

    t.assert.snapshot(sendMessage.mock.calls[0][0]);

    onSocketMessage.progress(true);
    onSocketMessage["progress-update"]({
      msg: "mock-msg",
      percent: "12",
      pluginName: "mock-plugin",
    });

    t.assert.snapshot(log.log.info.mock.calls[1][0]);
  });

  it("should run onSocketMessage.ok", (t) => {
    onSocketMessage.ok();

    t.assert.snapshot(sendMessage.mock.calls[0][0]);

    onSocketMessage.errors([]);
    onSocketMessage.hash("mock-hash");

    const res = onSocketMessage.ok();

    expect(res).toBeUndefined();
  });

  it("should run onSocketMessage['static-changed']", (t) => {
    onSocketMessage["static-changed"]();

    t.assert.snapshot(log.log.info.mock.calls[1][0]);
    expect(self.location.reload).toHaveBeenCalled();
  });

  it("should run onSocketMessage['static-changed'](file)", (t) => {
    onSocketMessage["static-changed"]("/static/assets/index.html");

    t.assert.snapshot(log.log.info.mock.calls[1][0]);
    expect(self.location.reload).toHaveBeenCalled();
  });

  it("should run onSocketMessage.warnings", (t) => {
    onSocketMessage.warnings(["warn1", "\u001B[4mwarn2\u001B[0m", "warn3"]);

    t.assert.snapshot(log.log.warn.mock.calls[0][0]);
    t.assert.snapshot(sendMessage.mock.calls[0][0]);
    t.assert.snapshot(log.log.warn.mock.calls.splice(1));

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

  it("should parse overlay options from resource query", async () => {
    // Re-evaluate client-src/index.js fresh after mutating __resourceQuery so
    // top-level option parsing runs again.
    async function reloadClient() {
      overlay.send.mockReset();
      socket.mockReset();
      const indexUrl = import.meta.resolve("../../client-src/index.js");
      await import(`${indexUrl}?t=${Date.now()}-${Math.random()}`);
      [[, onSocketMessage]] = socket.mock.calls;
    }

    // Pass JSON config with warnings disabled
    globalThis.__resourceQuery = `?overlay=${encodeURIComponent(
      '{"warnings": false}',
    )}`;
    await reloadClient();

    onSocketMessage.warnings(["warn1"]);
    expect(overlay.send).not.toHaveBeenCalled();

    onSocketMessage.errors(["error1"]);
    expect(overlay.send).toHaveBeenCalledTimes(1);
    expect(overlay.send).toHaveBeenCalledWith({
      type: "BUILD_ERROR",
      level: "error",
      messages: ["error1"],
    });

    // Pass JSON config with errors disabled
    globalThis.__resourceQuery = `?overlay=${encodeURIComponent(
      '{"errors": false}',
    )}`;
    await reloadClient();

    onSocketMessage.errors(["error1"]);
    expect(overlay.send).not.toHaveBeenCalled();

    onSocketMessage.warnings(["warn1"]);
    expect(overlay.send).toHaveBeenCalledTimes(1);
    expect(overlay.send).toHaveBeenCalledWith({
      type: "BUILD_ERROR",
      level: "warning",
      messages: ["warn1"],
    });

    // Use simple boolean
    globalThis.__resourceQuery = "?overlay=true";
    await reloadClient();

    onSocketMessage.warnings(["warn2"]);
    expect(overlay.send).toHaveBeenCalledTimes(1);
    expect(overlay.send).toHaveBeenLastCalledWith({
      type: "BUILD_ERROR",
      level: "warning",
      messages: ["warn2"],
    });

    onSocketMessage.errors(["error2"]);
    expect(overlay.send).toHaveBeenCalledTimes(2);
    expect(overlay.send).toHaveBeenLastCalledWith({
      type: "BUILD_ERROR",
      level: "error",
      messages: ["error2"],
    });
  });

  it("should run onSocketMessage.error", (t) => {
    onSocketMessage.error("error!!");

    t.assert.snapshot(log.log.error.mock.calls[0][0]);
  });

  it("should run onSocketMessage.close", (t) => {
    onSocketMessage.close();

    t.assert.snapshot(log.log.info.mock.calls[1][0]);
    t.assert.snapshot(sendMessage.mock.calls[0][0]);
  });

  it("should run onSocketMessage.close (hot enabled)", (t) => {
    // enabling hot
    onSocketMessage.hot();
    onSocketMessage.close();

    t.assert.snapshot(log.log.info.mock.calls[1][0]);
    t.assert.snapshot(sendMessage.mock.calls[0][0]);
  });

  it("should run onSocketMessage.close (liveReload enabled)", (t) => {
    // enabling liveReload
    onSocketMessage.liveReload();
    onSocketMessage.close();

    t.assert.snapshot(log.log.info.mock.calls[1][0]);
    t.assert.snapshot(sendMessage.mock.calls[0][0]);
  });
});
