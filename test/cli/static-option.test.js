'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-static'];

describe('"static" CLI option', () => {
  it('should work using "--static"', async () => {
    const { exitCode, stderr } = await testBin(['--static', '--port', port]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static new-static"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static',
      'new-static',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static new-static --static other-static"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static',
      'new-static',
      '--static',
      'other-static',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-reset"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static-reset',
      '--static',
      'new-static-after-reset',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-reset --static-directory new-static-directory"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static-reset',
      '--static-directory',
      'new-static-directory',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-directory static-dir"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static-directory',
      'static-dir',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-public-path /public"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static-public-path',
      '/public',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-public-path-reset"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static-public-path-reset',
      '--static-public-path',
      '/new-public',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-serve-index"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static-serve-index',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--no-static-serve-index"', async () => {
    const { exitCode, stderr } = await testBin([
      '--no-static-serve-index',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-watch"', async () => {
    const { exitCode, stderr } = await testBin([
      '--static-watch',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--no-static-watch"', async () => {
    const { exitCode, stderr } = await testBin([
      '--no-static-watch',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });
});
