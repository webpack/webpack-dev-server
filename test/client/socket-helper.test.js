/**
 * @jest-environment jsdom
 */

"use strict";

describe("socket", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it("should default to WebsocketClient when no __webpack_dev_server_client__ set", () => {
    jest.mock("../../client/clients/WebSocketClient");

    const socket = require("../../client/socket").default;
    const WebsocketClient =
      require("../../client/clients/WebSocketClient").default;

    const mockHandler = jest.fn();

    socket("my.url", {
      example: mockHandler,
    });

    const mockClientInstance = WebsocketClient.mock.instances[0];

    // this simulates receiving a message from the server and passing it
    // along to the callback of onMessage
    mockClientInstance.onMessage.mock.calls[0][0](
      JSON.stringify({
        type: "example",
        data: "hello world",
        params: { foo: "bar" },
      })
    );

    expect(WebsocketClient.mock.calls[0]).toMatchSnapshot();
    expect(mockClientInstance.onOpen.mock.calls).toMatchSnapshot();
    expect(mockClientInstance.onClose.mock.calls).toMatchSnapshot();
    expect(mockClientInstance.onMessage.mock.calls).toMatchSnapshot();
    expect(mockHandler.mock.calls).toMatchSnapshot();
  });

  it("should use __webpack_dev_server_client__ when set", () => {
    jest.mock("../../client/clients/WebSocketClient");

    const socket = require("../../client/socket").default;

    global.__webpack_dev_server_client__ =
      require("../../client/clients/WebSocketClient").default;

    const mockHandler = jest.fn();

    socket("my.url", {
      example: mockHandler,
    });

    const mockClientInstance =
      global.__webpack_dev_server_client__.mock.instances[0];

    // this simulates receiving a message from the server and passing it
    // along to the callback of onMessage
    mockClientInstance.onMessage.mock.calls[0][0](
      JSON.stringify({
        type: "example",
        data: "hello world",
        params: { foo: "bar" },
      })
    );

    expect(
      global.__webpack_dev_server_client__.mock.calls[0]
    ).toMatchSnapshot();
    expect(mockClientInstance.onOpen.mock.calls).toMatchSnapshot();
    expect(mockClientInstance.onClose.mock.calls).toMatchSnapshot();
    expect(mockClientInstance.onMessage.mock.calls).toMatchSnapshot();
    expect(mockHandler.mock.calls).toMatchSnapshot();
  });
});
