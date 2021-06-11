/**
 * @jest-environment jsdom
 */

'use strict';

describe("'parseURL' function", () => {
  const samples = [
    'test',
    '/',
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
      '../../../client-src/utils/getCurrentScriptSource.js',
      () => () => url
    );

    const parseURL = require('../../../client-src/utils/parseURL');

    test(`should return the url when __resourceQuery is '${url}'`, () => {
      expect(parseURL(url && `?${url}`)).toMatchSnapshot();
    });

    test(`should return the url when the current script source is '${url}'`, () => {
      expect(parseURL()).toMatchSnapshot();
    });

    // put here because resetModules mustn't be reset when L20 is finished
    jest.resetModules();
  });
});
