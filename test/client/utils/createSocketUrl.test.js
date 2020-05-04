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

  const samples2 = [
    // script source,       location,                output socket URL
    ['http://example.com', 'https://something.com', 'https://example.com/ws'],
    ['http://127.0.0.1', 'https://something.com', 'http://127.0.0.1/ws'],
    ['http://0.0.0.0', 'https://something.com', 'https://something.com/ws'],
    ['http://0.0.0.0', 'http://something.com', 'http://something.com/ws'],
    ['http://example.com', 'http://something.com', 'http://example.com/ws'],
    ['https://example.com', 'http://something.com', 'https://example.com/ws'],
  ];

  samples2.forEach(([scriptSrc, loc, expected]) => {
    jest.doMock(
      '../../../client-src/default/utils/getCurrentScriptSource.js',
      () => () => scriptSrc
    );

    const createSocketUrl = require('../../../client-src/default/utils/createSocketUrl');

    test(`should return socket ${expected} for script source ${scriptSrc} and location ${loc}`, () => {
      // eslint-disable-next-line no-undefined
      expect(createSocketUrl(undefined, loc).toString()).toEqual(expected);
    });

    jest.resetModules();
  });

  const samples3 = [
    // script source,       location,                output socket URL
    ['?http://example.com', 'https://something.com', 'https://example.com/ws'],
    ['?http://127.0.0.1', 'https://something.com', 'http://127.0.0.1/ws'],
    ['?http://0.0.0.0', 'https://something.com', 'https://something.com/ws'],
    ['?http://0.0.0.0', 'http://something.com', 'http://something.com/ws'],
    ['?http://example.com', 'http://something.com', 'http://example.com/ws'],
    ['?https://example.com', 'http://something.com', 'https://example.com/ws'],
    [
      '?https://example.com?sockHost=asdf',
      'http://something.com',
      'https://asdf/ws',
    ],
    [
      '?https://example.com?sockPort=34',
      'http://something.com',
      'https://example.com:34/ws',
    ],
    [
      '?https://example.com?sockPath=xxx',
      'http://something.com',
      'https://example.com/xxx',
    ],
    [
      '?http://0.0.0.0:8096&sockPort=8097',
      'http://localhost',
      'http://localhost:8097/ws',
    ],
    [
      '?http://example.com:8096&sockPort=location',
      'http://something.com',
      'http://example.com/ws',
    ],
    [
      '?http://0.0.0.0:8096&sockPort=location',
      'http://localhost:3000',
      'http://localhost:3000/ws',
    ],
  ];
  samples3.forEach(([scriptSrc, loc, expected]) => {
    test(`should return socket ${expected} for query ${scriptSrc} and location ${loc}`, () => {
      const createSocketUrl = require('../../../client-src/default/utils/createSocketUrl');

      expect(createSocketUrl(scriptSrc, loc).toString()).toEqual(expected);
    });
  });
});
