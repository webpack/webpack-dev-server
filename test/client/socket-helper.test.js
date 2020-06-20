'use strict';

describe('socket', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should default to WebsocketClient when no clientClass provided', () => {
    jest.mock('../../client/clients/WebsocketClient');
    const socket = require('../../client/default/socket');
    const WebsocketClient = require('../../client/clients/WebsocketClient');

    const mockHandler = jest.fn();
    socket(
      'my.url',
      {
        example: mockHandler,
      },
      null
    );

    const mockClientInstance = WebsocketClient.mock.instances[0];

    // this simulates receiving a message from the server and passing it
    // along to the callback of onMessage
    mockClientInstance.onMessage.mock.calls[0][0](
      JSON.stringify({
        type: 'example',
        data: 'hello world',
      })
    );

    expect(WebsocketClient.mock.calls[0]).toMatchSnapshot();
    expect(mockClientInstance.onOpen.mock.calls).toMatchSnapshot();
    expect(mockClientInstance.onClose.mock.calls).toMatchSnapshot();
    expect(mockClientInstance.onMessage.mock.calls).toMatchSnapshot();
    expect(mockHandler.mock.calls).toMatchSnapshot();
  });

  it('should use clientClass when passed in', () => {
    // sockjs is simply being used here so that the class can be
    // mocked and we can tell a WebsocketClient instance is not created
    jest.mock('../../client/clients/WebsocketClient');
    jest.mock('../../client/clients/SockJSClient');
    const socket = require('../../client/default/socket');
    const WebsocketClient = require('../../client/clients/WebsocketClient');
    const SockJSClient = require('../../client/clients/SockJSClient');
    const mockClientClass = SockJSClient;

    const mockHandler = jest.fn();
    socket(
      'my.url',
      {
        example: mockHandler,
      },
      mockClientClass
    );

    const mockClientInstance = mockClientClass.mock.instances[0];

    // this simulates receiving a message from the server and passing it
    // along to the callback of onMessage
    mockClientInstance.onMessage.mock.calls[0][0](
      JSON.stringify({
        type: 'example',
        data: 'hello world',
      })
    );

    expect(WebsocketClient.mock.instances.length).toEqual(0);
    expect(mockClientClass.mock.calls[0]).toMatchSnapshot();
    expect(mockClientInstance.onOpen.mock.calls).toMatchSnapshot();
    expect(mockClientInstance.onClose.mock.calls).toMatchSnapshot();
    expect(mockClientInstance.onMessage.mock.calls).toMatchSnapshot();
    expect(mockHandler.mock.calls).toMatchSnapshot();
  });
});
