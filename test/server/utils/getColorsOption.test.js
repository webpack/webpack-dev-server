'use strict';

const getColorsOption = require('../../../lib/utils/getColorsOption');

describe('getColorsOption', () => {
  it('should return false for empty config array', () => {
    expect(getColorsOption([])).toEqual(false);
  });

  it('should return false for config array with no colors option', () => {
    expect(
      getColorsOption([
        {
          entry: './index.js',
        },
      ])
    ).toEqual(false);
  });

  it('should return false for config array with stats string but no colors option', () => {
    expect(
      getColorsOption([
        {
          stats: 'verbose',
        },
      ])
    ).toEqual(false);
  });

  it('should return false for config array with stats object but no colors option', () => {
    expect(
      getColorsOption([
        {
          stats: {
            cached: false,
          },
        },
      ])
    ).toEqual(false);
  });

  it('should return false for first stats option with no colors option', () => {
    expect(
      getColorsOption([
        {
          stats: {
            cached: false,
          },
        },
        {
          stats: {
            colors: true,
          },
        },
      ])
    ).toEqual(false);
  });

  it('should return true for first stats option that has true colors option', () => {
    expect(
      getColorsOption([
        {
          stats: {
            colors: true,
          },
        },
        {
          stats: {
            cached: false,
          },
        },
      ])
    ).toEqual(true);
  });

  it('should return object for first stats option that has object colors option', () => {
    expect(
      getColorsOption([
        {
          stats: {
            colors: {
              green: '\u001b[32m',
            },
          },
        },
        {
          stats: {
            cached: false,
          },
        },
      ])
    ).toEqual({
      green: '\u001b[32m',
    });
  });
});
