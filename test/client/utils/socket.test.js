'use strict';

describe('socket', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('should default to SockJSClient when no __webpack_dev_server_client__ set', () => {
    jest.mock('../../../client/clients/SockJSClient');
    // eslint-disable-next-line global-require
    const socket = require('../../../client/socket');
    // eslint-disable-next-line global-require
    const SockJSClient = require('../../../client/clients/SockJSClient');

    const mockHandler = jest.fn();
    socket('my.url', {
      example: mockHandler,
    });

    const mockServerInstance = SockJSClient.mock.instances[0];

    // this simulates recieving a message from the server and passing it
    // along to the callback of onMessage
    mockServerInstance.onMessage.mock.calls[0][0](
      JSON.stringify({
        type: 'example',
        data: 'hello world',
      })
    );

    expect(SockJSClient.mock.calls[0]).toMatchSnapshot();
    expect(mockServerInstance.onOpen.mock.calls).toMatchSnapshot();
    expect(mockServerInstance.onClose.mock.calls).toMatchSnapshot();
    expect(mockServerInstance.onMessage.mock.calls).toMatchSnapshot();
    expect(mockHandler.mock.calls).toMatchSnapshot();
  });

  it('should use __webpack_dev_server_client__ when set', () => {
    jest.mock('../../../client/clients/SockJSClient');
    // eslint-disable-next-line global-require
    const socket = require('../../../client/socket');
    // eslint-disable-next-line global-require
    global.__webpack_dev_server_client__ = require('../../../client/clients/SockJSClient');

    const mockHandler = jest.fn();
    socket('my.url', {
      example: mockHandler,
    });

    const mockServerInstance =
      global.__webpack_dev_server_client__.mock.instances[0];

    // this simulates recieving a message from the server and passing it
    // along to the callback of onMessage
    mockServerInstance.onMessage.mock.calls[0][0](
      JSON.stringify({
        type: 'example',
        data: 'hello world',
      })
    );

    expect(
      global.__webpack_dev_server_client__.mock.calls[0]
    ).toMatchSnapshot();
    expect(mockServerInstance.onOpen.mock.calls).toMatchSnapshot();
    expect(mockServerInstance.onClose.mock.calls).toMatchSnapshot();
    expect(mockServerInstance.onMessage.mock.calls).toMatchSnapshot();
    expect(mockHandler.mock.calls).toMatchSnapshot();
  });
});
