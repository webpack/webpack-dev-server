'use strict';

describe('createSocketUrl', () => {
  const samples = [
    // __resourceQuery, location and socket URL
    ['?http://example.com', 'http://example.com', 'http://example.com/ws'],
    ['?http://example.com', 'http://something.com', 'http://example.com/ws'],
    [null, 'http://example.com', 'http://example.com/ws'],
    ['?https://example.com', 'https://example.com', 'https://example.com/ws'],
    [null, 'https://example.com', 'https://example.com/ws'],
    [
      '?http://example.com&port=8080',
      'http://example.com:8080',
      'http://example.com:8080/ws',
    ],
    [
      '?http://example.com:0',
      'http://example.com:8080',
      'http://example.com:8080/ws',
    ],
    [null, 'http://example.com:8080', 'http://example.com:8080/ws'],
    [
      '?http://example.com/path/foo.js',
      'http://example.com/foo/bar',
      'http://example.com/ws',
    ],
    [null, 'http://example.com/foo/bar', 'http://example.com/ws'],
    [
      '?http://user:password@localhost/',
      'http://user:password@localhost/',
      'http://user:password@localhost/ws',
    ],
    [
      null,
      'http://user:password@localhost/',
      'http://user:password@localhost/ws',
    ],
    [
      '?http://user:password@localhost:8080/',
      'http://user:password@localhost/',
      'http://user:password@localhost:8080/ws',
    ],
    [
      null,
      'http://user:password@localhost:8080/',
      'http://user:password@localhost:8080/ws',
    ],
    ['?http://0.0.0.0', 'http://127.0.0.1', 'http://127.0.0.1/ws'],
    ['?http://0.0.0.0', 'http://192.168.0.1', 'http://192.168.0.1/ws'],
    ['?http://0.0.0.0', 'https://192.168.0.1', 'https://192.168.0.1/ws'],
    ['?http://0.0.0.0', 'https://example.com', 'https://example.com/ws'],
    [
      '?http://0.0.0.0',
      'https://example.com:8080',
      'https://example.com:8080/ws',
    ],
    [
      '?http://0.0.0.0&port=9090',
      'https://example.com',
      'https://example.com:9090/ws',
    ],
    [
      '?http://0.0.0.0&port=9090',
      'https://example.com:8080',
      'https://example.com:9090/ws',
    ],
    ['?http://localhost', 'http://localhost', 'http://localhost/ws'],
    [
      '?http://localhost:8080',
      'http://localhost:8080',
      'http://localhost:8080/ws',
    ],
    [
      '?https://localhost:8080',
      'https://localhost:8080',
      'https://localhost:8080/ws',
    ],
    [null, 'https://localhost:8080', 'https://localhost:8080/ws'],
    ['?http://127.0.0.1', 'http://something.com', 'http://127.0.0.1/ws'],
    ['?http://127.0.0.1', 'https://something.com', 'http://127.0.0.1/ws'],
    ['?https://127.0.0.1', 'http://something.com', 'https://127.0.0.1/ws'],
    [
      '?https://example.com&host=example.com',
      'http://something.com',
      'https://example.com/ws',
    ],
    [
      '?https://example.com&path=custom',
      'http://something.com',
      'https://example.com/custom',
    ],
    [
      '?https://example.com&path=/custom',
      'http://something.com',
      'https://example.com/custom',
    ],
    ['?http://[::]', 'http://something.com', 'http://something.com/ws'],
    ['?http://[::]', 'https://something.com', 'https://something.com/ws'],
    ['?http://[::1]:8080/', 'http://[::1]:8080/', 'http://[::1]:8080/ws'],
    ['?https://[::1]:8080/', 'http://[::1]:8080/', 'https://[::1]:8080/ws'],
    [null, 'http://[::1]:8080/', 'http://[::1]:8080/ws'],
    [null, 'https://[::1]:8080/', 'https://[::1]:8080/ws'],
  ];

  samples.forEach(([__resourceQuery, location, expected]) => {
    jest.doMock('../../../client-src/utils/getCurrentScriptSource', () => () =>
      location
    );

    const createSocketUrl = require('../../../client-src/utils/createSocketUrl');
    const parseURL = require('../../../client-src/utils/parseURL');

    test.only(`should return '${expected}' socket URL when '__resourceQuery' is '${__resourceQuery}' and 'self.location' is '${location}'`, () => {
      const selfLocation = new URL(location);

      delete window.location;

      window.location = selfLocation;

      const parsedURL = parseURL(__resourceQuery);

      expect(createSocketUrl(parsedURL)).toBe(expected);
    });

    jest.resetModules();
  });
});
