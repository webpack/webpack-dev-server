'use strict';

describe('index', () => {
  let log;
  let socket;
  let overlay;
  let reloadApp;
  let sendMessage;
  let onSocketMessage;
  const locationValue = self.location;
  const resourceQueryValue = global.__resourceQuery;

  beforeEach(() => {
    global.__resourceQuery = 'foo';

    // log
    jest.setMock('../../client-src/utils/log.js', {
      log: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      setLogLevel: jest.fn(),
    });
    log = require('../../client-src/utils/log');

    // socket
    jest.setMock('../../client-src/socket.js', jest.fn());
    socket = require('../../client-src/socket');

    // overlay
    jest.setMock('../../client-src/overlay.js', {
      clear: jest.fn(),
      showMessage: jest.fn(),
    });
    overlay = require('../../client-src/overlay');

    // reloadApp
    jest.setMock('../../client-src/utils/reloadApp.js', jest.fn());
    reloadApp = require('../../client-src/utils/reloadApp');

    // sendMessage
    jest.setMock('../../client-src/utils/sendMessage.js', jest.fn());
    sendMessage = require('../../client-src/utils/sendMessage');

    // getUrlOptions
    jest.setMock('../../client-src/utils/parseURL.js', () => {
      return {
        query: {
          logging: 'info',
        },
      };
    });

    // createSocketUrl
    jest.setMock('../../client-src/utils/createSocketURL.js', () => 'mock-url');

    // issue: https://github.com/jsdom/jsdom/issues/2112
    delete window.location;
    window.location = {
      ...locationValue,
      reload: jest.fn(),
    };

    require('../../client-src');
    onSocketMessage = socket.mock.calls[0][1];
  });

  afterEach(() => {
    global.__resourceQuery = resourceQueryValue;
    Object.assign(self, locationValue);
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('should set arguments into socket function', () => {
    expect(socket.mock.calls[0]).toMatchSnapshot();
  });

  test('should run onSocketMessage.hot', () => {
    onSocketMessage.hot();
    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
  });

  test('should run onSocketMessage.liveReload', () => {
    onSocketMessage.liveReload();
    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
  });

  test('should run onSocketMessage.invalid', () => {
    onSocketMessage.invalid();
    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
    expect(overlay.clear).not.toBeCalled();

    // change flags
    onSocketMessage.overlay(true);
    onSocketMessage.invalid();
    expect(overlay.clear).toBeCalled();
  });

  test("should run onSocketMessage['still-ok']", () => {
    onSocketMessage['still-ok']();
    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
    expect(overlay.clear).not.toBeCalled();

    // change flags
    onSocketMessage.overlay(true);
    onSocketMessage['still-ok']();
    expect(overlay.clear).toBeCalled();
  });

  test("should run onSocketMessage.progress and onSocketMessage['progress-update']", () => {
    onSocketMessage.progress(false);
    onSocketMessage['progress-update']({
      msg: 'mock-msg',
      percent: '12',
    });
    expect(log.log.info).not.toBeCalled();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();

    onSocketMessage.progress(true);
    onSocketMessage['progress-update']({
      msg: 'mock-msg',
      percent: '12',
    });
    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
  });

  test("should run onSocketMessage.progress and onSocketMessage['progress-update'] and log plugin name", () => {
    onSocketMessage.progress(false);
    onSocketMessage['progress-update']({
      msg: 'mock-msg',
      percent: '12',
      pluginName: 'mock-plugin',
    });
    expect(log.log.info).not.toBeCalled();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();

    onSocketMessage.progress(true);
    onSocketMessage['progress-update']({
      msg: 'mock-msg',
      percent: '12',
      pluginName: 'mock-plugin',
    });
    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
  });

  test('should run onSocketMessage.overlay with an argument is Object', () => {
    onSocketMessage.overlay({
      warnings: true,
      errors: true,
    });

    // check if flags have changed
    onSocketMessage.invalid();
    expect(overlay.clear).toBeCalled();
  });

  test('should run onSocketMessage.ok', () => {
    {
      const res = onSocketMessage.ok();
      expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
      expect(res).toEqual(false);
    }

    // change flags
    {
      onSocketMessage.errors([]);
      onSocketMessage.hash('mock-hash');

      const res = onSocketMessage.ok();
      expect(reloadApp).toBeCalled();
      expect(reloadApp.mock.calls[0][0]).toMatchSnapshot();
      // eslint-disable-next-line no-undefined
      expect(res).toEqual(undefined);
    }
  });

  test("should run onSocketMessage['content-changed']", () => {
    onSocketMessage['content-changed']();

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test("should run onSocketMessage['static-changed']", () => {
    onSocketMessage['static-changed']();

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test("should run onSocketMessage['static-changed'](file)", () => {
    onSocketMessage['static-changed']('/static/assets/index.html');

    expect(log.log.info.mock.calls[0][0]).toMatchSnapshot();
    expect(self.location.reload).toBeCalled();
  });

  test('should run onSocketMessage.warnings', () => {
    {
      const res = onSocketMessage.warnings([
        'warn1',
        '\u001B[4mwarn2\u001B[0m',
        'warn3',
      ]);
      expect(res).toEqual(false);

      expect(log.log.warn.mock.calls[0][0]).toMatchSnapshot();
      expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
      expect(log.log.warn.mock.calls.splice(1)).toMatchSnapshot();
    }

    // change flags
    {
      onSocketMessage.overlay({
        warnings: true,
      });
      const res = onSocketMessage.warnings([]);
      // eslint-disable-next-line no-undefined
      expect(res).toEqual(undefined);

      expect(overlay.showMessage).toBeCalled();
      expect(reloadApp).toBeCalled();
    }
  });

  test('should run onSocketMessage.errors', () => {
    onSocketMessage.errors(['error1', '\u001B[4error2\u001B[0m', 'error3']);

    expect(log.log.error.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
    expect(log.log.error.mock.calls.splice(1)).toMatchSnapshot();

    // change flags
    onSocketMessage.overlay({
      errors: true,
    });
    onSocketMessage.errors([]);
    expect(overlay.showMessage).toBeCalled();
  });

  test('should run onSocketMessage.error', () => {
    onSocketMessage.error('error!!');
    expect(log.log.error.mock.calls[0][0]).toMatchSnapshot();
  });

  test('should run onSocketMessage.close', () => {
    onSocketMessage.close();
    expect(log.log.error.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });

  test('should run onSocketMessage.close (hot enabled)', () => {
    // enabling hot
    onSocketMessage.hot();
    onSocketMessage.close();
    expect(log.log.error.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });

  test('should run onSocketMessage.close (liveReload enabled)', () => {
    // enabling liveReload
    onSocketMessage.liveReload();
    onSocketMessage.close();
    expect(log.log.error.mock.calls[0][0]).toMatchSnapshot();
    expect(sendMessage.mock.calls[0][0]).toMatchSnapshot();
  });

  test('should update log level if options is passed', () => {
    expect(log.setLogLevel.mock.calls[0][0]).toMatchSnapshot();
  });
});
