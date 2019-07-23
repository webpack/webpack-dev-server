'use strict';

const createLogger = require('../../../lib/utils/createLogger');

describe('createLogger util', () => {
  it('should create logger without options', () => {
    const { log, level } = createLogger();

    expect(typeof log.log).toBe('function');
    expect(level).toBe('info');
  });

  it('should create logger with logLevel option (debug)', () => {
    const { level } = createLogger({ logLevel: 'debug' });

    expect(level).toBe('debug');
  });

  it('should create logger with logLevel option (warn)', () => {
    const { level } = createLogger({ logLevel: 'warn' });

    expect(level).toBe('warn');
  });

  it('should create logger with noInfo option', () => {
    const { level } = createLogger({ noInfo: true });

    expect(level).toBe('warn');
  });

  it('should create logger with quiet option', () => {
    const { level } = createLogger({ quiet: true });

    expect(level).toBe('none');
  });

  // it('should create logger with logTime option', () => {
  //   const logger = createLogger({ logTime: true });

  //   expect(logger.currentLevel).toBe(2);
  // });
});
