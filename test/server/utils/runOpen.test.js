'use strict';

const open = require('open');
const runOpen = require('../../../lib/utils/runOpen');

jest.mock('open');

describe('runOpen util', () => {
  afterEach(() => {
    open.mockClear();
  });

  describe('should open browser', () => {
    beforeEach(() => {
      open.mockImplementation(() => Promise.resolve());
    });

    it('on specify URL', () =>
      runOpen('https://example.com', {}, console).then(() => {
        expect(open).toBeCalledWith('https://example.com', { wait: false });

        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com",
            Object {
              "wait": false,
            },
          ]
        `);
      }));

    it('on specify URL with page', () =>
      runOpen('https://example.com', { openPage: '/index.html' }, console).then(
        () => {
          expect(open).toBeCalledWith('https://example.com/index.html', {
            wait: false,
          });

          expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "wait": false,
            },
          ]
        `);
        }
      ));

    it('on specify URL with page inside array', () =>
      runOpen(
        'https://example.com',
        { openPage: ['/index.html'] },
        console
      ).then(() => {
        expect(open).toBeCalledWith('https://example.com/index.html', {
          wait: false,
        });

        expect(open.mock.calls[0]).toMatchSnapshot();
      }));

    it('on specify URL with multiple pages inside array', () =>
      runOpen(
        'https://example.com',
        { openPage: ['/index.html', '/index2.html'] },
        console
      ).then(() => {
        expect(open).toBeCalledWith('https://example.com/index.html', {
          wait: false,
        });
        expect(open).toBeCalledWith('https://example.com/index2.html', {
          wait: false,
        });

        expect(open.mock.calls[0]).toMatchSnapshot();
        expect(open.mock.calls[1]).toMatchSnapshot();
      }));

    it('on specify URL in Google Chrome', () =>
      runOpen('https://example.com', { open: 'Google Chrome' }, console).then(
        () => {
          expect(open).toBeCalledWith('https://example.com', {
            app: 'Google Chrome',
            wait: false,
          });

          expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
        }
      ));

    it('on specify URL with page in Google Chrome ', () =>
      runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: '/index.html' },
        console
      ).then(() => {
        expect(open).toBeCalledWith('https://example.com/index.html', {
          app: 'Google Chrome',
          wait: false,
        });

        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      }));

    it('on specify absolute https URL with page in Google Chrome ', () =>
      runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: 'https://example2.com' },
        console
      ).then(() => {
        expect(open).toBeCalledWith('https://example2.com', {
          app: 'Google Chrome',
          wait: false,
        });

        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example2.com",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      }));

    it('on specify absolute http URL with page in Google Chrome ', () =>
      runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: 'http://example2.com' },
        console
      ).then(() => {
        expect(open).toBeCalledWith('http://example2.com', {
          app: 'Google Chrome',
          wait: false,
        });
        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "http://example2.com",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      }));
  });

  it('on specify multiple absolute https URLs with pages in Google Chrome ', () =>
    runOpen(
      'https://example.com',
      {
        open: 'Google Chrome',
        openPage: ['https://example2.com', 'https://example3.com'],
      },
      console
    ).then(() => {
      expect(open).toBeCalledWith('https://example2.com', {
        app: 'Google Chrome',
        wait: false,
      });
      expect(open).toBeCalledWith('https://example3.com', {
        app: 'Google Chrome',
        wait: false,
      });
      expect(open.mock.calls[0]).toMatchSnapshot();
      expect(open.mock.calls[1]).toMatchSnapshot();
    }));

  it('on specify one relative URL and one absolute URL with pages in Google Chrome ', () =>
    runOpen(
      'https://example.com',
      {
        open: 'Google Chrome',
        openPage: ['/index.html', 'https://example2.com'],
      },
      console
    ).then(() => {
      expect(open).toBeCalledWith('https://example.com/index.html', {
        app: 'Google Chrome',
        wait: false,
      });
      expect(open).toBeCalledWith('https://example2.com', {
        app: 'Google Chrome',
        wait: false,
      });

      expect(open.mock.calls[0]).toMatchSnapshot();
      expect(open.mock.calls[1]).toMatchSnapshot();
    }));

  describe('should not open browser', () => {
    const logMock = { warn: jest.fn() };

    beforeEach(() => {
      open.mockImplementation(() => Promise.reject());
    });

    afterEach(() => {
      logMock.warn.mockClear();
    });

    it('on specify URL and log error', () =>
      runOpen('https://example.com', {}, logMock).then(() => {
        expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
          `"Unable to open \\"https://example.com\\" in browser. If you are running in a headless environment, please do not use the --open flag"`
        );
        expect(open).toBeCalledWith('https://example.com', { wait: false });

        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com",
            Object {
              "wait": false,
            },
          ]
        `);
      }));

    it('on specify URL with page and log error', () =>
      runOpen('https://example.com', { openPage: '/index.html' }, logMock).then(
        () => {
          expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
            `"Unable to open \\"https://example.com/index.html\\" in browser. If you are running in a headless environment, please do not use the --open flag"`
          );
          expect(open).toBeCalledWith('https://example.com/index.html', {
            wait: false,
          });

          expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "wait": false,
            },
          ]
        `);
        }
      ));

    it('on specify URL in Google Chrome and log error', () =>
      runOpen('https://example.com', { open: 'Google Chrome' }, logMock).then(
        () => {
          expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
            `"Unable to open \\"https://example.com\\" in browser: \\"Google Chrome\\". If you are running in a headless environment, please do not use the --open flag"`
          );
          expect(open).toBeCalledWith('https://example.com', {
            app: 'Google Chrome',
            wait: false,
          });

          expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
        }
      ));

    it('on specify URL with page in Google Chrome and log error ', () =>
      runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: '/index.html' },
        logMock
      ).then(() => {
        expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
          `"Unable to open \\"https://example.com/index.html\\" in browser: \\"Google Chrome\\". If you are running in a headless environment, please do not use the --open flag"`
        );
        expect(open).toBeCalledWith('https://example.com/index.html', {
          app: 'Google Chrome',
          wait: false,
        });

        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "app": "Google Chrome",
              "wait": false,
            },
          ]
        `);
      }));

    it('on specify URL with page in Google Chrome incognito mode and log error ', () =>
      runOpen(
        'https://example.com',
        {
          open: { app: ['Google Chrome', '--incognito'] },
          openPage: '/index.html',
        },
        logMock
      ).then(() => {
        expect(open).toBeCalledWith('https://example.com/index.html', {
          app: ['Google Chrome', '--incognito'],
        });

        expect(open.mock.calls[0]).toMatchInlineSnapshot(`
          Array [
            "https://example.com/index.html",
            Object {
              "app": Array [
                "Google Chrome",
                "--incognito",
              ],
            },
          ]
        `);
      }));
  });
});
