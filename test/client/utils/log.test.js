'use strict';

describe('log', () => {
  let logMock;
  let setLogLevel;

  beforeEach(() => {
    jest.mock('loglevel');
    logMock = require('loglevel');
    logMock.getLogger.mockImplementation(() => {
      return {
        error: jest.fn(),
        setLevel: jest.fn(),
        setDefaultLevel: jest.fn(),
        disableAll: jest.fn(),
      };
    });

    setLogLevel = require('../../../client-src/default/utils/log').setLogLevel;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('should set info as the default level', () => {
    const setDefaultLevel =
      logMock.getLogger.mock.results[0].value.setDefaultLevel;

    expect(setDefaultLevel).toBeCalled();
    expect(setDefaultLevel.mock.calls[0][0]).toEqual('info');
  });

  test('should set log level via setLogLevel', () => {
    ['info', 'warn', 'error', 'debug', 'trace', 'warning'].forEach((level) => {
      setLogLevel(level);
    });

    expect(
      logMock.getLogger.mock.results[0].value.setLevel.mock.calls
    ).toMatchSnapshot();
  });

  test('should set none and silent via setLogLevel', () => {
    ['none', 'silent'].forEach((level) => {
      setLogLevel(level);
    });

    expect(
      logMock.getLogger.mock.results[0].value.disableAll.mock.results
    ).toHaveLength(2);
  });

  test('should output exception log when the level is unknown', () => {
    setLogLevel('foo');

    expect(
      logMock.getLogger.mock.results[0].value.error.mock.calls[0][0]
    ).toMatchSnapshot();
  });
});
