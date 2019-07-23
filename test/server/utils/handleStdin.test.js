'use strict';

const handleStdin = require('../../../lib/utils/handleStdin');

describe.skip('handleStdin', () => {
  let exitSpy;

  beforeAll(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    process.stdin.removeAllListeners('end');
    exitSpy.mockReset();
  });

  describe('enabled', () => {
    it('should exit process', (done) => {
      handleStdin({
        stdin: true,
      });
      process.stdin.emit('end');
      process.stdin.pause();
      setTimeout(() => {
        expect(exitSpy.mock.calls[0]).toEqual([0]);
        done();
      }, 1000);
    });
  });

  describe('disabled (default)', () => {
    it('should not exit process', (done) => {
      handleStdin({});
      process.stdin.emit('end');
      process.stdin.pause();
      setTimeout(() => {
        expect(exitSpy.mock.calls.length).toEqual(0);
        done();
      }, 1000);
    });
  });
});
