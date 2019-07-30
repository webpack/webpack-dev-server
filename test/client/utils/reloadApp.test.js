'use strict';

/* global self */

describe('reloadApp', () => {
  let reloadApp;
  let log;
  let locationValue;

  beforeEach(() => {
    locationValue = self.location;

    self.postMessage = jest.fn();
    self.location.reload = jest.fn();

    jest.mock('loglevel');

    log = require('loglevel');
    log.getLogger.mockImplementation(() => {
      return {
        info: jest.fn(),
        setDefaultLevel: jest.fn(),
      };
    });

    reloadApp = require('../../../client-src/default/utils/reloadApp');
  });

  afterEach(() => {
    Object.assign(self, locationValue);
    jest.resetAllMocks();
    jest.resetModules();
  });

  test('should do nothing when isUnloading is true or hotReload is false', () => {
    // eslint-disable-next-line no-undefined
    expect(reloadApp({}, { isUnloading: false })).toEqual(undefined);
    expect(log.getLogger.mock.results[0].value.info).not.toBeCalled();
    expect(reloadApp({ hotReload: false }, { isUnloading: false })).toEqual(
      // eslint-disable-next-line no-undefined
      undefined
    );
    expect(log.getLogger.mock.results[0].value.info).not.toBeCalled();
  });

  test('should run hot', () => {
    jest.mock('webpack/hot/emitter');
    const emitter = require('webpack/hot/emitter');
    emitter.emit = jest.fn();

    reloadApp(
      { hot: true, hotReload: true },
      { isUnloading: false, currentHash: 'hash' }
    );

    expect(
      log.getLogger.mock.results[0].value.info.mock.calls[0][0]
    ).toMatchSnapshot();
    expect(emitter.emit.mock.calls[0][0]).toMatchSnapshot();
    expect(self.postMessage.mock.calls[0]).toMatchSnapshot();
  });

  test('should run liveReload when protocol is about:', (done) => {
    Object.defineProperty(self, 'location', {
      value: {
        ...self.location,
        protocol: 'about:',
      },
    });

    reloadApp(
      { hot: false, hotReload: true, liveReload: true },
      { isUnloading: false }
    );

    setTimeout(() => {
      expect(
        log.getLogger.mock.results[0].value.info.mock.calls[0][0]
      ).toMatchSnapshot();
      expect(self.location.reload).toBeCalled();
      done();
    });
  });

  test('should run liveReload when protocol is http:', (done) => {
    reloadApp(
      { hot: false, hotReload: true, liveReload: true },
      { isUnloading: false }
    );

    setTimeout(() => {
      expect(
        log.getLogger.mock.results[0].value.info.mock.calls[0][0]
      ).toMatchSnapshot();
      expect(self.location.reload).toBeCalled();
      done();
    });
  });
});
