"use strict";

const { beforeEach, describe, it } = require("node:test");
const { expect } = require("expect");
const { fn } = require("jest-mock");

require("../helpers/jsdom-setup");

describe("socket", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it("should default to WebsocketClient when no __webpack_dev_server_client__ set", (t) => {
    jest.mock("../../client/clients/WebSocketClient");

    const socket = require("../../client/socket").default;
    const WebsocketClient =
      require("../../client/clients/WebSocketClient").default;

    const mockHandler = fn();

    socket("my.url", {
      example: mockHandler,
    });

    const [mockClientInstance] = WebsocketClient.mock.instances;

    // this simulates receiving a message from the server and passing it
    // along to the callback of onMessage
    mockClientInstance.onMessage.mock.calls[0][0](
      JSON.stringify({
        type: "example",
        data: "hello world",
        params: { foo: "bar" },
      }),
    );

    t.assert.snapshot(WebsocketClient.mock.calls[0]);
    t.assert.snapshot(mockClientInstance.onOpen.mock.calls);
    t.assert.snapshot(mockClientInstance.onClose.mock.calls);
    t.assert.snapshot(mockClientInstance.onMessage.mock.calls);
    t.assert.snapshot(mockHandler.mock.calls);
  });

  it("should use __webpack_dev_server_client__ when set", (t) => {
    jest.mock("../../client/clients/WebSocketClient");

    const socket = require("../../client/socket").default;

    globalThis.__webpack_dev_server_client__ =
      require("../../client/clients/WebSocketClient").default;

    const mockHandler = fn();

    socket("my.url", {
      example: mockHandler,
    });

    const [mockClientInstance] =
      globalThis.__webpack_dev_server_client__.mock.instances;

    // this simulates receiving a message from the server and passing it
    // along to the callback of onMessage
    mockClientInstance.onMessage.mock.calls[0][0](
      JSON.stringify({
        type: "example",
        data: "hello world",
        params: { foo: "bar" },
      }),
    );

    t.assert.snapshot(globalThis.__webpack_dev_server_client__.mock.calls[0]);
    t.assert.snapshot(mockClientInstance.onOpen.mock.calls);
    t.assert.snapshot(mockClientInstance.onClose.mock.calls);
    t.assert.snapshot(mockClientInstance.onMessage.mock.calls);
    t.assert.snapshot(mockHandler.mock.calls);
  });

  it("should export initialized client", () => {
    const socket = require("../../client/socket").default;

    const nonInitializedInstance = require("../../client/socket").client;

    expect(nonInitializedInstance).toBeNull();

    socket("my.url", {});

    const initializedInstance = require("../../client/socket").client;

    expect(initializedInstance).not.toBeNull();
    expect(typeof initializedInstance.onClose).toBe("function");
    expect(typeof initializedInstance.onMessage).toBe("function");
    expect(typeof initializedInstance.onOpen).toBe("function");
  });
});
