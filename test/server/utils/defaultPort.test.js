'use strict';

const defaultPort = require('../../../lib/utils/defaultPort');

describe('defaultPort util', () => {
  it('should return value', () => {
    expect(defaultPort).toBe(8080);
  });
});
