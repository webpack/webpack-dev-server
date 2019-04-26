'use strict';

const options = require('../../lib/options.json');

describe('options', () => {
  it('should return properties', () => {
    expect(options.properties).toMatchSnapshot();
  });

  it('should return errorMessage', () => {
    expect(options.errorMessage.properties).toMatchSnapshot();
  });

  it('should match properties and errorMessage', () => {
    const properties = Object.keys(options.properties);
    const messages = Object.keys(options.errorMessage.properties);

    expect(properties.length).toEqual(messages.length);

    const res = properties.every((name) => messages.includes(name));

    expect(res).toEqual(true);
  });
});
