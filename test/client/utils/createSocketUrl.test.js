'use strict';

describe('createSocketUrl', () => {
  const samples = [
    [
      // script source
      { hostname: '127.0.0.1', protocol: 'http:', query: {} },
      // location
      'https://something.com',
      // output socket URL
      'http://127.0.0.1/ws',
    ],
    [
      { hostname: '0.0.0.0', protocol: 'http:', query: {} },
      'https://something.com',
      'https://something.com/ws',
    ],
    [
      { hostname: '0.0.0.0', protocol: 'http:', query: {} },
      'http://something.com',
      'http://something.com/ws',
    ],
    [
      { hostname: '::', protocol: 'http:', query: {} },
      'https://something.com',
      'https://something.com/ws',
    ],
    [
      { hostname: 'example.com', protocol: 'http:', query: {} },
      'http://something.com',
      'http://example.com/ws',
    ],
    [
      { hostname: 'example.com', protocol: 'https:', query: {} },
      'http://something.com',
      'https://example.com/ws',
    ],
    [
      { hostname: 'example.com', protocol: 'https:', query: { host: 'asdf' } },
      'http://something.com',
      'https://asdf/ws',
    ],
    [
      { hostname: 'example.com', protocol: 'https:', query: { port: '34' } },
      'http://something.com',
      'https://example.com:34/ws',
    ],
    [
      { hostname: 'example.com', protocol: 'https:', query: { path: 'xxx' } },
      'http://something.com',
      'https://example.com/xxx',
    ],
    [
      {
        hostname: '0.0.0.0',
        port: 8096,
        protocol: 'http:',
        query: { port: '8097' },
      },
      null,
      'http://localhost:8097/ws',
    ],
    [
      {
        hostname: 'example.com',
        port: 8096,
        protocol: 'http:',
        query: { port: 'location' },
      },
      'http://something.com',
      'http://example.com/ws',
    ],
    [
      {
        hostname: '0.0.0.0',
        port: 8096,
        protocol: 'http:',
        query: { port: 'location' },
      },
      'http://localhost:3000',
      'http://localhost:3000/ws',
    ],
  ];

  samples.forEach(([url, loc, expected]) => {
    const createSocketUrl = require('../../../client-src/default/utils/createSocketUrl');

    test(`should return socket ${expected} for url ${JSON.stringify(
      url
    )} and location ${loc}`, () => {
      // eslint-disable-next-line no-undefined
      expect(createSocketUrl(url, loc).toString()).toEqual(expected);
    });
  });
});
