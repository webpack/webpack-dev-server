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
    it(`should close server, then exit process (${signal})`, (done) => {
      setupExitSignals(server);
      process.emit(signal);

      setTimeout(() => {
        expect(server.close.mock.calls.length).toEqual(1);
        expect(exitSpy.mock.calls.length).toEqual(1);
        done();
      }, 1000);
    });
  });
});
