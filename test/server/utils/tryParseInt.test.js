'use strict';

const tryParseInt = require('../../../lib/utils/tryParseInt');

describe('tryParseInt util', () => {
  it('should parser number as number', () => {
    expect(tryParseInt(1)).toBe(1);
  });

  it('should parser string as number', () => {
    expect(tryParseInt('1')).toBe(1);
  });

  it('should parser undefined as null', () => {
    // eslint-disable-next-line no-undefined
    expect(tryParseInt(undefined)).toBe(null);
  });

  it('should parser NaN as null', () => {
    expect(tryParseInt(NaN)).toBe(null);
  });
});
