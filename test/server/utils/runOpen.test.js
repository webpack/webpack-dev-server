'use strict';

const opn = require('opn');
const runOpen = require('../../../lib/utils/runOpen');

jest.mock('opn');

describe('runOpen util', () => {
  afterEach(() => {
    opn.mockClear();
  });

  describe('should open browser', () => {
    beforeEach(() => {
      opn.mockImplementation(() => Promise.resolve());
    });

    it('on specify URL', () => {
      return runOpen('https://example.com', {}, console).then(() => {
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com",
            Object {
              "wait": false,
            },
          ]
        `);
      });
    });

    it('on specify URL with page', () => {
      return runOpen(
        'https://example.com',
        { openPage: '/index.html' },
        console
      ).then(() => {
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "wait": false,
            },
          ]
        `);
      });
    });

    it('on specify URL in Google Chrome', () => {
      return runOpen(
        'https://example.com',
        { open: 'Google Chrome' },
        console
      ).then(() => {
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      });
    });

    it('on specify URL with page in Google Chrome ', () => {
      return runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: '/index.html' },
        console
      ).then(() => {
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      });
    });

    it('on specify absolute https URL with page in Google Chrome ', () => {
      return runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: 'https://example2.com' },
        console
      ).then(() => {
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example2.com",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      });
    });

    it('on specify absolute http URL with page in Google Chrome ', () => {
      return runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: 'http://example2.com' },
        console
      ).then(() => {
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "http://example2.com",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      });
    });
  });

  describe('should not open browser', () => {
    const logMock = { warn: jest.fn() };

    beforeEach(() => {
      opn.mockImplementation(() => Promise.reject());
    });

    afterEach(() => {
      logMock.warn.mockClear();
    });

    it('on specify URL and log error', () => {
      return runOpen('https://example.com', {}, logMock).then(() => {
        expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
          `"Unable to open browser. If you are running in a headless environment, please do not use the --open flag"`
        );
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com",
            Object {
              "wait": false,
            },
          ]
        `);
      });
    });

    it('on specify URL with page and log error', () => {
      return runOpen(
        'https://example.com',
        { openPage: '/index.html' },
        logMock
      ).then(() => {
        expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
          `"Unable to open browser. If you are running in a headless environment, please do not use the --open flag"`
        );
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "wait": false,
            },
          ]
        `);
      });
    });

    it('on specify URL in Google Chrome and log error', () => {
      return runOpen(
        'https://example.com',
        { open: 'Google Chrome' },
        logMock
      ).then(() => {
        expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
          `"Unable to open browser: Google Chrome. If you are running in a headless environment, please do not use the --open flag"`
        );
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      });
    });

    it('on specify URL with page in Google Chrome and log error ', () => {
      return runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: '/index.html' },
        logMock
      ).then(() => {
        expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
          `"Unable to open browser: Google Chrome. If you are running in a headless environment, please do not use the --open flag"`
        );
        expect(opn.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      });
    });
  });
});
