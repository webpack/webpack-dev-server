'use strict';

describe('createSocketUrl', () => {
  const samples = [
    '?test',
    'https://example.com',
    'https://example.com/path',
    'https://example.com/path/foo.js',
    'http://user:password@localhost/',
    'http://0.0.0.0',
    'https://localhost:123',
    'http://user:pass@[::]:8080',
    'http://127.0.0.1',
    // TODO: comment out after the major release
    // https://github.com/webpack/webpack-dev-server/pull/1954#issuecomment-498043376
    // 'file://filename',
    // eslint-disable-next-line no-undefined
    undefined,
  ];

  samples.forEach((url) => {
    jest.doMock(
      '../../../client-src/default/utils/getCurrentScriptSource.js',
      () => () => url
    );

    const createSocketUrl = require('../../../client-src/default/utils/createSocketUrl');

    test(`should return the url when __resourceQuery is ${url}`, () => {
      const query = url ? url.querystring : url;
      expect(createSocketUrl(query)).toMatchSnapshot();
    });

    test(`should return the url when the current script source is ${url}`, () => {
      expect(createSocketUrl()).toMatchSnapshot();
    });

    // put here because resetModules mustn't be reset when L20 is finished
    jest.resetModules();
  });
});
