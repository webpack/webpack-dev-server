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

    it('on specify URL', async () => {
      await runOpen('https://example.com', {}, console);

      expect(open.mock.calls[0]).toEqual(['https://example.com', {}]);
    });

    it('on specify URL with page', async () => {
      await runOpen(
        'https://example.com',
        { openPage: '/index.html' },
        console
      );

      expect(open.mock.calls[0]).toEqual([
        'https://example.com/index.html',
        {},
      ]);
    });

    it('on specify URL in Google Chrome', async () => {
      await runOpen('https://example.com', { open: 'Google Chrome' }, console);

      expect(open.mock.calls[0]).toEqual([
        'https://example.com',
        { app: 'Google Chrome' },
      ]);
    });

    it('on specify URL with page in Google Chrome ', async () => {
      await runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: '/index.html' },
        console
      );

      expect(open.mock.calls[0]).toEqual([
        'https://example.com/index.html',
        { app: 'Google Chrome' },
      ]);
    });
  });

  describe('should not open browser', () => {
    const logMock = { warn: jest.fn() };

    beforeEach(() => {
      open.mockImplementation(() => Promise.reject());
    });

    afterEach(() => {
      logMock.warn.mockClear();
    });

    it('on specify URL and log error', async () => {
      await runOpen('https://example.com', {}, logMock);

      expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
        `"Unable to open browser. If you are running in a headless environment, please do not use the --open flag"`
      );
      expect(open.mock.calls[0]).toEqual(['https://example.com', {}]);
    });

    it('on specify URL with page and log error', async () => {
      await runOpen(
        'https://example.com',
        { openPage: '/index.html' },
        logMock
      );

      expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
        `"Unable to open browser. If you are running in a headless environment, please do not use the --open flag"`
      );
      expect(open.mock.calls[0]).toEqual([
        'https://example.com/index.html',
        {},
      ]);
    });

    it('on specify URL in Google Chrome and log error', async () => {
      await runOpen('https://example.com', { open: 'Google Chrome' }, logMock);

      expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
        `"Unable to open browser: Google Chrome. If you are running in a headless environment, please do not use the --open flag"`
      );
      expect(open.mock.calls[0]).toEqual([
        'https://example.com',
        {
          app: 'Google Chrome',
        },
      ]);
    });

    it('on specify URL with page in Google Chrome and log error ', async () => {
      await runOpen(
        'https://example.com',
        { open: 'Google Chrome', openPage: '/index.html' },
        logMock
      );

      expect(logMock.warn.mock.calls[0][0]).toMatchInlineSnapshot(
        `"Unable to open browser: Google Chrome. If you are running in a headless environment, please do not use the --open flag"`
      );
      expect(open.mock.calls[0]).toEqual([
        'https://example.com/index.html',
        { app: 'Google Chrome' },
      ]);
    });
  });
});
