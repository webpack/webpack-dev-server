'use strict';

const defaultTo = require('../../../lib/utils/defaultTo');

const noop = () => {};
const array = [1, 2, 3];

describe('defaultTo util', () => {
  it('should returns value', () => {
    expect(defaultTo(0, 200)).toBe(0);
    expect(defaultTo(100, 200)).toBe(100);
    expect(defaultTo('', 200)).toBe('');
    expect(defaultTo('string', 200)).toBe('string');
    expect(defaultTo(noop, 200)).toBe(noop);
    expect(defaultTo(array, 200)).toEqual(array);
    expect(defaultTo(null, 200)).toBe(200);
    // eslint-disable-next-line no-undefined
    expect(defaultTo(undefined, 200)).toBe(200);
  });
});
