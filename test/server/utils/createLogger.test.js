'use strict';

const webpack = require('webpack');
const createLogger = require('../../../lib/utils/createLogger');
const config = require('../../fixtures/simple-config/webpack.config');

describe('createLogger util', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('without the compiler', () => {
    let consoleMock;

    beforeEach(() => {
      consoleMock = jest.spyOn(console, 'info');
    });

    it('should output log when use the default level', () => {
      const logger = createLogger(null);

      logger.info('foo');

      expect(consoleMock).toBeCalled();
      expect(consoleMock.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should not output log when specify the level', () => {
      const logger = createLogger(null, 'none');

      logger.info('foo');
      expect(consoleMock).not.toBeCalled();
    });
  });

  describe('with the compiler', () => {
    let consoleMock;

    beforeEach(() => {
      consoleMock = jest.spyOn(process.stderr, 'write');
    });

    it('should output log when use the default level', () => {
      const compiler = webpack(config);
      const logger = createLogger(compiler);

      logger.info('foo');
      expect(consoleMock).toBeCalled();
      expect(consoleMock.mock.calls[0][0]).toMatchSnapshot();
    });

    it('should not output log when specify the level', () => {
      const compiler = webpack({
        ...config,
        infrastructureLogging: {
          level: 'none',
        },
      });
      const logger = createLogger(compiler);

      logger.info('foo');
      expect(consoleMock).not.toBeCalled();
    });
  });
});
