/**
 * @jest-environment jsdom
 */

'use strict';

describe("'createSocketURL' function ", () => {
  const samples = [
    // __resourceQuery, location and socket URL
    ['?http://example.com/ws', 'http://example.com', 'ws://example.com/ws'],
    [
      `?${encodeURIComponent('http://example.com/ws')}`,
      'http://example.com',
      'ws://example.com/ws',
    ],
    [
      `?${encodeURIComponent('http://example.com/ws?foo=bar')}`,
      'http://example.com',
      'ws://example.com/ws',
    ],
    ['?http://example.com/ws', 'http://something.com', 'ws://example.com/ws'],
    [null, 'http://example.com', 'ws://example.com/ws'],
    ['?https://example.com/ws', 'https://example.com', 'wss://example.com/ws'],
    [null, 'https://example.com', 'wss://example.com/ws'],
    [
      '?http://example.com:0/ws',
      'http://example.com:8080',
      'ws://example.com:8080/ws',
    ],
    [null, 'http://example.com:8080', 'ws://example.com:8080/ws'],
    [
      '?http://example.com/custom-path/',
      'http://example.com/foo/bar',
      'ws://example.com/custom-path/',
    ],
    [null, 'http://example.com/foo/bar', 'ws://example.com/ws'],
    [
      '?http://user:password@localhost/ws',
      'http://user:password@localhost/',
      'ws://user:password@localhost/ws',
    ],
    [
      null,
      'http://user:password@localhost/',
      'ws://user:password@localhost/ws',
    ],
    [
      '?http://user:password@localhost:8080/ws',
      'http://user:password@localhost/',
      'ws://user:password@localhost:8080/ws',
    ],
    [null, 'http://user@localhost:8080/', 'ws://user@localhost:8080/ws'],
    [
      null,
      'http://user:password@localhost:8080/',
      'ws://user:password@localhost:8080/ws',
    ],
    ['?http://0.0.0.0/ws', 'http://127.0.0.1', 'ws://127.0.0.1/ws'],
    ['?http://0.0.0.0/ws', 'http://192.168.0.1', 'ws://192.168.0.1/ws'],
    ['?http://0.0.0.0/ws', 'https://192.168.0.1', 'wss://192.168.0.1/ws'],
    ['?http://0.0.0.0/ws', 'https://example.com', 'wss://example.com/ws'],
    [
      '?http://0.0.0.0/ws',
      'https://example.com:8080',
      'wss://example.com:8080/ws',
    ],
    [
      '?https://0.0.0.0/ws',
      'https://example.com:8080',
      'wss://example.com:8080/ws',
    ],
    ['?http://localhost/ws', 'http://localhost', 'ws://localhost/ws'],
    [
      '?http://localhost:8080/ws',
      'http://localhost:8080',
      'ws://localhost:8080/ws',
    ],
    [
      '?https://localhost:8080/ws',
      'https://localhost:8080',
      'wss://localhost:8080/ws',
    ],
    [null, 'https://localhost:8080', 'wss://localhost:8080/ws'],
    ['?http://127.0.0.1/ws', 'http://something.com', 'ws://127.0.0.1/ws'],
    ['?http://127.0.0.1/ws', 'https://something.com', 'ws://127.0.0.1/ws'],
    ['?https://127.0.0.1/ws', 'http://something.com', 'wss://127.0.0.1/ws'],
    [null, 'http://127.0.0.1', 'ws://127.0.0.1/ws'],
    [null, 'http://127.0.0.1:8080', 'ws://127.0.0.1:8080/ws'],
    [null, 'https://127.0.0.1', 'wss://127.0.0.1/ws'],
    ['?http://[::]/ws', 'http://something.com', 'ws://something.com/ws'],
    ['?http://[::]/ws', 'https://something.com', 'wss://something.com/ws'],
    ['?http://[::1]:8080/ws', 'http://[::1]:8080/', 'ws://[::1]:8080/ws'],
    ['?https://[::1]:8080/ws', 'http://[::1]:8080/', 'wss://[::1]:8080/ws'],
    [null, 'http://[::1]:8080/ws', 'ws://[::1]:8080/ws'],
    [null, 'https://[::1]:8080/ws', 'wss://[::1]:8080/ws'],
    [null, 'file:///home/user/project/index.html', 'ws://localhost/ws'],
    [null, 'chrome-extension://localhost/', 'ws://localhost/ws'],
    [null, 'file://localhost/', 'ws://localhost/ws'],
  ];

  samples.forEach(([__resourceQuery, location, expected]) => {
    jest.doMock(
      '../../../client-src/utils/getCurrentScriptSource',
      () => () => new URL('./entry.js', location).toString()
    );

    const createSocketURL = require('../../../client-src/utils/createSocketURL');
    const parseURL = require('../../../client-src/utils/parseURL');

    test(`should return '${expected}' socket URL when '__resourceQuery' is '${__resourceQuery}' and 'self.location' is '${location}'`, () => {
      const selfLocation = new URL(location);

      delete window.location;

      window.location = selfLocation;

      const parsedURL = parseURL(__resourceQuery);

      expect(createSocketURL(parsedURL)).toBe(expected);
    });

    jest.resetModules();
  });
});
