'use strict';

const webpack = require('webpack');
const getCompilerConfigArray = require('../../../lib/utils/getCompilerConfigArray');
const getStatsOption = require('../../../lib/utils/getStatsOption');
const isWebpack5 = require('../../helpers/isWebpack5');

describe('getStatsOption', () => {
  it('should return empty stats object for empty array', () => {
    expect(getStatsOption([])).toEqual({});
  });

  it('should return empty stats object for array with no stats option', () => {
    expect(
      getStatsOption([
        {
          entry: './index.js',
        },
      ])
    ).toEqual({});
  });

  it('should return stats string for array with stats string', () => {
    expect(
      getStatsOption([
        {
          stats: 'verbose',
        },
      ])
    ).toEqual('verbose');
  });

  it('should return stats object for array with stats object', () => {
    expect(
      getStatsOption([
        {
          stats: {
            colors: {
              green: '\u001b[32m',
            },
          },
        },
      ])
    ).toEqual({
      colors: {
        green: '\u001b[32m',
      },
    });
  });

  it('should return first existing stats option', () => {
    expect(
      getStatsOption([
        {
          entry: './index.js',
        },
        {
          stats: 'verbose',
        },
        {
          stats: 'none',
        },
      ])
    ).toEqual('verbose');
  });

  it('should find first stats option in webpack config', () => {
    const compiler = webpack([
      {
        entry: './index.js',
      },
      {
        stats: {},
      },
      {
        stats: 'errors-only',
      },
      {
        stats: 'none',
      },
    ]);
    const configArr = getCompilerConfigArray(compiler);
    const statsOption = getStatsOption(configArr);
    if (isWebpack5) {
      expect(statsOption).toEqual({
        preset: 'errors-only',
      });
    } else {
      expect(statsOption).toEqual('errors-only');
    }
  });
});
