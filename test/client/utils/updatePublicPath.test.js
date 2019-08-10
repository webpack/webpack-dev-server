'use strict';

/* eslint-disable camelcase, no-undef */

describe('updatePublicPath', () => {
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

  global.__webpack_public_path__ = '';

  samples.forEach((url) => {
    jest.doMock(
      '../../../client-src/default/utils/getCurrentScriptSource.js',
      () => () => url
    );

    const {
      default: updatePublicPath,
      // eslint-disable-next-line global-require
    } = require('../../../client-src/default/utils/updatePublicPath');

    test(`should set public path when __resourceQuery is ${url}`, () => {
      __webpack_public_path__ = '';
      updatePublicPath(`?${url}`);
      expect(__webpack_public_path__).toMatchSnapshot();
    });

    test(`should set public path when the current script source is ${url}`, () => {
      __webpack_public_path__ = '';
      updatePublicPath();
      expect(__webpack_public_path__).toMatchSnapshot();
    });

    jest.resetModules();
  });
});
