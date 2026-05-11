import "../helpers/jsdom-setup.js";

import { beforeEach, describe, it, mock } from "node:test";
import { expect } from "expect";
import { fn } from "jest-mock";

/**
 * Build a fresh mock WebSocketClient class. Each `new MockClient(url)`
 * registers the instance and arguments on the static `.mock` so tests can
 * assert on them.
 * @returns {new (url: string) => unknown} mock client constructor
 */
function createMockClient() {
  class MockClient {
    constructor(url) {
      MockClient.mock.instances.push(this);
      MockClient.mock.calls.push([url]);
      this.onOpen = fn();
      this.onClose = fn();
      this.onMessage = fn();
    }
  }
  MockClient.mock = { instances: [], calls: [] };
  return MockClient;
}

describe("socket", () => {
  beforeEach(() => {
    delete globalThis.__webpack_dev_server_client__;
  });

  it("should default to WebsocketClient when no __webpack_dev_server_client__ set", async (t) => {
    const MockClient = createMockClient();
    const webSocketClientMock = mock.module(
      "../../client-src/clients/WebSocketClient.js",
      {
        defaultExport: MockClient,
      },
    );

    try {
      const freshSocket = (
        await import(`../../client-src/socket.js?t=${Date.now()}`)
      ).default;

      const mockHandler = fn();

      freshSocket("my.url", {
        example: mockHandler,
      });

      const [mockClientInstance] = MockClient.mock.instances;

      mockClientInstance.onMessage.mock.calls[0][0](
        JSON.stringify({
          type: "example",
          data: "hello world",
          params: { foo: "bar" },
        }),
      );

      t.assert.snapshot(MockClient.mock.calls[0]);
      t.assert.snapshot(mockClientInstance.onOpen.mock.calls);
      t.assert.snapshot(mockClientInstance.onClose.mock.calls);
      t.assert.snapshot(mockClientInstance.onMessage.mock.calls);
      t.assert.snapshot(mockHandler.mock.calls);
    } finally {
      webSocketClientMock.restore();
    }
  });

  it("should use __webpack_dev_server_client__ when set", async (t) => {
    const MockClient = createMockClient();
    globalThis.__webpack_dev_server_client__ = MockClient;

    const socket = (
      await import(`../../client-src/socket.js?t=${Date.now()}-${Math.random()}`)
    ).default;

    const mockHandler = fn();

    socket("my.url", {
      example: mockHandler,
    });

    const [mockClientInstance] =
      globalThis.__webpack_dev_server_client__.mock.instances;

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

  it("should export initialized client", async () => {
    const MockClient = createMockClient();
    globalThis.__webpack_dev_server_client__ = MockClient;

    const socketMod = await import(
      `../../client-src/socket.js?t=${Date.now()}-${Math.random()}`
    );
    const socket = socketMod.default;

    socket("my.url", {});

    const initializedInstance = socketMod.client;

    expect(initializedInstance).not.toBeNull();
    expect(typeof initializedInstance.onClose).toBe("function");
    expect(typeof initializedInstance.onMessage).toBe("function");
    expect(typeof initializedInstance.onOpen).toBe("function");
  });
});
