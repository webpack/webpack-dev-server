'use strict';

const setupExitSignals = require('../../../lib/utils/setupExitSignals');

describe('setupExitSignals', () => {
  let server;
  let exitSpy;
  let stdinResumeSpy;
  const signals = ['SIGINT', 'SIGTERM'];

  beforeAll(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    stdinResumeSpy = jest
      .spyOn(process.stdin, 'resume')
      .mockImplementation(() => {});
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
    process.stdin.removeAllListeners('end');
  });

  signals.forEach((signal) => {
    it(`should close server, then exit process (${signal})`, (done) => {
      const serverSetupExitSignals = Object.assign(
        {
          options: {
            setupExitSignals: true,
          },
        },
        server
      );
      setupExitSignals(serverSetupExitSignals);
      process.emit(signal);

      setTimeout(() => {
        expect(server.close.mock.calls.length).toEqual(1);
        expect(exitSpy.mock.calls.length).toEqual(1);
        done();
      }, 1000);
    });
  });

  it(`should resume stdin if stdin: true`, () => {
    const serverStdin = Object.assign(
      {
        options: {
          stdin: true,
        },
      },
      server
    );
    setupExitSignals(serverStdin);
    expect(stdinResumeSpy.mock.calls.length).toEqual(1);
  });

  it(`should close server, then exit process (stdin end)`, (done) => {
    const serverStdin = Object.assign(
      {
        options: {
          stdin: true,
        },
      },
      server
    );
    setupExitSignals(serverStdin);
    process.stdin.emit('end');

    setTimeout(() => {
      expect(server.close.mock.calls.length).toEqual(1);
      expect(exitSpy.mock.calls.length).toEqual(1);
      done();
    }, 1000);
  });
});
