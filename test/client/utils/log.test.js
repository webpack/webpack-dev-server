/**
 * @jest-environment jsdom
 */

'use strict';

describe("'log' function", () => {
  let logMock;
  let setLogLevel;

  beforeEach(() => {
    jest.setMock('webpack/lib/logging/runtime', {
      getLogger: jest.fn(),
      configureDefaultLogger: jest.fn(),
    });
    logMock = require('webpack/lib/logging/runtime');

    setLogLevel = require('../../../client-src/utils/log').setLogLevel;
  });

  afterEach(() => {
    logMock.getLogger.mockClear();
    logMock.configureDefaultLogger.mockClear();
  });

  test('should set info as the default level and create logger', () => {
    const getLogger = logMock.getLogger;
    const configureDefaultLogger = logMock.configureDefaultLogger;

    expect(configureDefaultLogger).toBeCalled();
    expect(configureDefaultLogger.mock.calls[0][0]).toEqual({
      level: 'info',
    });

    expect(getLogger).toBeCalled();
    expect(getLogger.mock.calls[0][0]).toEqual('webpack-dev-server');
  });

  test('should set log level via setLogLevel', () => {
    ['none', 'error', 'warn', 'info', 'log', 'verbose'].forEach((level) => {
      setLogLevel(level);
    });

    expect(logMock.configureDefaultLogger.mock.calls).toMatchSnapshot();
  });
});
