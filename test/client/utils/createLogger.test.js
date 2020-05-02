'use strict';

const createLogger = require('../../../client-src/default/utils/createLogger');

describe('log', () => {
  let consoleMock;

  beforeEach(() => {
    consoleMock = jest.spyOn(console, 'info');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should output log when use the default level', () => {
    const logger = createLogger();

    logger.info('foo');

    expect(consoleMock).toBeCalled();
    expect(consoleMock.mock.calls[0][0]).toMatchSnapshot();
  });

  it('should not output log when specify the level', () => {
    const logger = createLogger('none');

    logger.info('foo');
    expect(consoleMock).not.toBeCalled();
  });
});
