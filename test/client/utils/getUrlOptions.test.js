'use strict';

describe('getUrlOptions', () => {
  const samples = [
    'test',
    'https://example.com',
    'https://example.com/path',
    'https://example.com/path/foo.js',
    'http://user:password@localhost/',
    'http://0.0.0.0',
    'https://localhost:123',
    'http://user:pass@[::]:8080',
    'http://127.0.0.1',
    'file://filename',
    // eslint-disable-next-line no-undefined
    undefined,
  ];

  samples.forEach((url) => {
    jest.doMock(
      '../../../client-src/default/utils/getCurrentScriptSource.js',
      () => () => url
    );

    const getUrlOptions = require('../../../client-src/default/utils/getUrlOptions');

    test(`should return the url when __resourceQuery is ${url}`, () => {
      expect(getUrlOptions(url && `?${url}`)).toMatchSnapshot();
    });

    test(`should return the url when the current script source is ${url}`, () => {
      expect(getUrlOptions()).toMatchSnapshot();
    });

    // put here because resetModules mustn't be reset when L20 is finished
    jest.resetModules();
  });
});
