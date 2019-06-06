'use strict';

const createLogger = require('../../../lib/utils/createLogger');

describe('createLogger util', () => {
  it('should create logger without options', () => {
    const logger = createLogger();

    expect(logger.name).toBe('wds');
    expect(logger.currentLevel).toBe(2);
  });

  it('should create logger with logLevel option (debug)', () => {
    const logger = createLogger({ logLevel: 'debug' });

    expect(logger.name).toBe('wds');
    expect(logger.currentLevel).toBe(1);
  });

  it('should create logger with logLevel option (warn)', () => {
    const logger = createLogger({ logLevel: 'warn' });

    expect(logger.name).toBe('wds');
    expect(logger.currentLevel).toBe(3);
  });

  it('should create logger with noInfo option', () => {
    const logger = createLogger({ noInfo: true });

    expect(logger.name).toBe('wds');
    expect(logger.currentLevel).toBe(3);
  });

  it('should create logger with quiet option', () => {
    const logger = createLogger({ quiet: true });

    expect(logger.name).toBe('wds');
    expect(logger.currentLevel).toBe(5);
  });

  it('should create logger with logTime option', () => {
    const logger = createLogger({ logTime: true });

    expect(logger.name).toBe('wds');
    expect(logger.currentLevel).toBe(2);
  });
});
