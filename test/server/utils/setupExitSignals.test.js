'use strict';

const setupExitSignals = require('../../../lib/utils/setupExitSignals');

describe('setupExitSignals', () => {
  let server;
  let exitSpy;
  const signals = ['SIGINT', 'SIGTERM'];

  beforeAll(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    server = {
      close: jest.fn((callback) => {
        callback();
      }),
    };
  });

  afterEach(() => {
    exitSpy.mockReset();
    server.close.mockClear();
    signals.forEach((signal) => {
      process.removeAllListeners(signal);
    });
  });

  signals.forEach((signal) => {
    it(`should exit process (${signal}, server never defined)`, (done) => {
      setupExitSignals({
        server: null,
      });
      process.emit(signal);
      setTimeout(() => {
        expect(exitSpy.mock.calls.length).toEqual(1);
        done();
      }, 1000);
    });

    it(`should close server, then exit process (${signal}, server defined before signal)`, (done) => {
      const serverData = {
        server: null,
      };
      setupExitSignals(serverData);

      setTimeout(() => {
        serverData.server = server;
        process.emit(signal);
      }, 500);

      setTimeout(() => {
        expect(server.close.mock.calls.length).toEqual(1);
        expect(exitSpy.mock.calls.length).toEqual(1);
        done();
      }, 1500);
    });
  });
});
