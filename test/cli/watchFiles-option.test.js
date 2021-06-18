'use strict';

const path = require('path');
const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('watchFiles option', () => {
  it('--watch-files <value>', async () => {
    const watchDirectory = path.resolve(__dirname, '../fixtures/static/static');

    const { exitCode, stderr } = await testBin([
      '--watch-files',
      watchDirectory,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--watch-files <value> --watch-files <other-value>', async () => {
    const watchDirectory = path.resolve(__dirname, '../fixtures/static/static');
    const watchOtherDirectory = path.resolve(
      __dirname,
      '../fixtures/static/simple-config'
    );

    const { exitCode, stderr } = await testBin([
      '--watch-files',
      watchDirectory,
      '--watch-files',
      watchOtherDirectory,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--watch-files-reset', async () => {
    const watchDirectory = path.resolve(__dirname, '../fixtures/static/static');

    const { exitCode, stderr } = await testBin([
      '--watch-files-reset',
      '--watch-files',
      watchDirectory,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });
});
