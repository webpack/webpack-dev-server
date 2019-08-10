'use strict';

const timer = require('../../helpers/timer');
const handleStdin = require('../../../lib/utils/handleStdin');

describe('handleStdin', () => {
  let exitSpy;

  beforeAll(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    process.stdin.removeAllListeners('end');
    exitSpy.mockReset();
  });

  describe('enabled', () => {
    it('should exit process', async () => {
      handleStdin({
        stdin: true,
      });
      process.stdin.emit('end');

      await timer(1000);
      process.stdin.pause();
      expect(exitSpy.mock.calls[0]).toEqual([0]);
    });
  });

  describe('disabled (default)', () => {
    it('should not exit process', async () => {
      handleStdin({});
      process.stdin.emit('end');

      await timer(1000);
      process.stdin.pause();
      expect(exitSpy.mock.calls.length).toEqual(0);
    });
  });
});
