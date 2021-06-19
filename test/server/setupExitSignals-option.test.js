'use strict';

const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map')['setup-exit-signals-option'];

describe('setupExitSignals option', () => {
  let server;
  let exitSpy;
  let killSpy;
  let stdinResumeSpy;
  const signals = ['SIGINT', 'SIGTERM'];

  beforeEach((done) => {
    server = testServer.start(
      config,
      {
        setupExitSignals: true,
        port,
      },
      done
    );
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    stdinResumeSpy = jest
      .spyOn(process.stdin, 'resume')
      .mockImplementation(() => {});
    killSpy = jest.spyOn(server.server, 'kill');
  });

  afterEach((done) => {
    exitSpy.mockReset();
    stdinResumeSpy.mockReset();
    signals.forEach((signal) => {
      process.removeAllListeners(signal);
    });
    process.stdin.removeAllListeners('end');
    testServer.close(done);
  });

  it.each(signals)('should close and exit on %s', (signal, done) => {
    process.emit(signal);

    setTimeout(() => {
      expect(killSpy.mock.calls.length).toEqual(1);
      expect(exitSpy.mock.calls.length).toEqual(1);
      done();
    }, 1000);
  });
});
