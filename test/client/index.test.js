'use strict';

/* eslint-disable
  global-require,
  no-undefined
*/
/* global self */

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
    // make this an empty string so that it works on Node when we need
    // to redirect the __resourceQuery to another file,
    // e.g. require(`./index${__resourceQuery}`) will not work with Node
    // unless __resourceQuery === ''
    global.__resourceQuery = '';
    self.location.reload = jest.fn();

    // log
    jest.setMock('../../client/default/utils/log.js', {
      log: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
    });
    log = require('../../client/utils/log');

    // socket
    jest.setMock('../../client/default/socket.js', jest.fn());
    socket = require('../../client/socket');

    // overlay
    jest.setMock('../../client/default/overlay.js', {
      clear: jest.fn(),
      showMessage: jest.fn(),
    });
    overlay = require('../../client/overlay');

    // reloadApp
    jest.setMock('../../client/default/utils/reloadApp.js', jest.fn());
    reloadApp = require('../../client/utils/reloadApp');

    // sendMessage
    jest.setMock('../../client/default/utils/sendMessage.js', jest.fn());
    sendMessage = require('../../client/utils/sendMessage');

    // createSocketUrl
    jest.setMock(
      '../../client/default/utils/createSocketUrl.js',
      () => 'mock-url'
    );

    require('../../client/index');
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

  // TODO: need to mock require.context
  test.skip("should run onSocketMessage['log-level']", () => {
    onSocketMessage['log-level']();
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
      expect(res).toEqual(undefined);
    }
  });

  test("should run onSocketMessage['content-changed']", () => {
    onSocketMessage['content-changed']();

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
});
