'use strict';

describe('getUrlParts', () => {
  const samples = [
    'test',
    'https://example.com',
    'https://example.com/path',
    'https://example.com/path/foo.js',
    'http://user:password@localhost/',
    'http://0.0.0.0',
    'https://localhost:123',
    'http://user:pass@[::]:8080',
    `http://0.0.0.0:9000?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}`,
    `http://0.0.0.0:9000?sockHost=${encodeURIComponent('my.host')}`,
    'http://0.0.0.0:9000?sockPort=8888',
    `http://0.0.0.0:9000?publicPath=${encodeURIComponent('/dist/')}`,
    `http://0.0.0.0:9000?publicPath=${encodeURIComponent('/long/dist/path/')}`,
    `http://0.0.0.0:9000?publicPath=${encodeURIComponent(
      'http://my.host:8888/dist/'
    )}`,
    `http://0.0.0.0:9000?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}&sockHost=${encodeURIComponent('my.host')}&sockPort=8888`,
    `http://0.0.0.0:9000?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}&sockHost=${encodeURIComponent(
      'my.host'
    )}&sockPort=8888&publicPath=${encodeURIComponent(
      'http://my.host:8888/dist/'
    )}`,
    `http://user:pass@[::]:8080?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}&sockPort=8888`,
    `http://user:pass@[::]:8080?sockPath=${encodeURIComponent(
      '/path/to/sockjs-node'
    )}&sockHost=${encodeURIComponent('my.host')}&sockPort=8888`,
  ];

  samples.forEach((url) => {
    jest.doMock(
      '../../../client-src/default/utils/getCurrentScriptSource.js',
      () => () => url
    );

    // eslint-disable-next-line global-require
    const getUrlParts = require('../../../client-src/default/utils/getUrlParts');

    test(`should return url parts when __resourceQuery is ${url}`, () => {
      expect(getUrlParts(`?${url}`)).toMatchSnapshot();
    });

    test(`should return url parts when the current script source is ${url}`, () => {
      expect(getUrlParts()).toMatchSnapshot();
    });

    jest.resetModules();
  });
});
