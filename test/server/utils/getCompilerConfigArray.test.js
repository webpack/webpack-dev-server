'use strict';

const webpack = require('webpack');
const getCompilerConfigArray = require('../../../lib/utils/getCompilerConfigArray');

describe('getCompilerConfigArray', () => {
  it('should get config array from single compiler', () => {
    const compiler = webpack({
      stats: 'errors-only',
    });
    const configArr = getCompilerConfigArray(compiler);
    expect(configArr.length).toEqual(1);
    expect(configArr[0].stats).toEqual('errors-only');
  });

  it('should get config array from multi compiler', () => {
    const compiler = webpack([
      {
        stats: 'none',
      },
      {
        stats: 'verbose',
      },
    ]);
    const configArr = getCompilerConfigArray(compiler);
    expect(configArr.length).toEqual(2);
    expect(configArr[0].stats).toEqual('none');
    expect(configArr[1].stats).toEqual('verbose');
  });
});
