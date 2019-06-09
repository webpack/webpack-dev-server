'use strict';

describe('log', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.resetModules();
  });

  describe('check log variables', () => {
    test('should attach [WDS] prefix', () => {
      // eslint-disable-next-line global-require
      const { log } = require('../../../client-src/default/utils/log');

      console.info = jest.fn();
      log.setLevel('info');
      log.info('test!!');
      expect(console.info.mock.calls[0][0]).toMatchSnapshot();
    });

    test('should change the default log level', () => {
      // eslint-disable-next-line global-require
      const { log } = require('../../../client-src/default/utils/log');

      expect(log.getLevel()).toEqual(2);
      log.setLevel('error');
      expect(log.getLevel()).toEqual(4);
    });
  });

  describe('check setLogLevel', () => {
    let logMock;
    let setLogLevel;

    beforeEach(() => {
      jest.mock('loglevel');
      // eslint-disable-next-line global-require
      logMock = require('loglevel');
      logMock.getLogger.mockImplementation(() => {
        return {
          error: jest.fn(),
          setLevel: jest.fn(),
          setDefaultLevel: jest.fn(),
          disableAll: jest.fn(),
        };
      });

      // eslint-disable-next-line global-require
      setLogLevel = require('../../../client-src/default/utils/log')
        .setLogLevel;
    });

    test('should set log levels', () => {
      ['info', 'warn', 'error', 'debug', 'trace', 'warning'].forEach(
        (level) => {
          setLogLevel(level);
        }
      );

      expect(
        logMock.getLogger.mock.results[0].value.setLevel.mock.calls
      ).toMatchSnapshot();
    });

    test('should set none and silent', () => {
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
});
