'use strict';

const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const timer = require('../helpers/timer');
const port = require('../ports-map')['stdin-option'];

describe('stdin', () => {
  // eslint-disable-next-line no-unused-vars
  let server;
  let exitSpy;

  beforeAll(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach((done) => {
    server = null;
    exitSpy.mockReset();
    process.stdin.removeAllListeners('end');
    testServer.close(done);
  });

  describe('enabled', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          port,
          stdin: true,
        },
        done
      );
    });

    it('should exit process', async () => {
      process.stdin.emit('end');
      await timer(1000);
      process.stdin.pause();
      expect(exitSpy.mock.calls[0]).toEqual([0]);
    });
  });

  describe('disabled (default)', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          port,
        },
        done
      );
    });

    it('should not exit process', async () => {
      process.stdin.emit('end');
      await timer(1000);
      process.stdin.pause();
      expect(exitSpy.mock.calls.length).toEqual(0);
    });
  });
});
