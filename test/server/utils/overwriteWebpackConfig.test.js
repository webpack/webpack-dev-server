'use strict';

const overwriteWebpackConfig = require('../../../lib/utils/overwriteWebpackConfig');

describe('colors', () => {
  it('should set default color as true when config[0].stats is null', () => {
    const config = [{}];

    overwriteWebpackConfig(config);
    expect(config).toMatchSnapshot();
  });

  it('should pass the value when config[0].stats is a string', () => {
    const config = [{ stats: 'foo' }];

    overwriteWebpackConfig(config);
    expect(config).toMatchSnapshot();
  });

  it('should set default color as true when config[0].stats is an object', () => {
    const config = [{ stats: { foo: 'bar' } }];

    overwriteWebpackConfig(config);
    expect(config).toMatchSnapshot();
  });

  it('should not overwrite when config[0].stats.colors is not null', () => {
    const config = [{ stats: { colors: 'foo' } }];

    overwriteWebpackConfig(config);
    expect(config).toMatchSnapshot();
  });
});
