'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('"static" CLI option', () => {
  it('should work using "--static"', async () => {
    const { exitCode, stderr } = await testBin('--static');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static new-static"', async () => {
    const { exitCode, stderr } = await testBin('--static new-static');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static new-static --static other-static"', async () => {
    const { exitCode, stderr } = await testBin(
      '--static new-static --static other-static'
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-reset"', async () => {
    const { exitCode, stderr } = await testBin(
      '--static-reset --static new-static-after-reset'
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-reset --static-directory new-static-directory"', async () => {
    const { exitCode, stderr } = await testBin(
      '--static-reset --static-directory new-static-directory'
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-directory static-dir"', async () => {
    const { exitCode, stderr } = await testBin('--static-directory static-dir');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-public-path /public"', async () => {
    const { exitCode, stderr } = await testBin('--static-public-path /public');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-public-path-reset"', async () => {
    const { exitCode, stderr } = await testBin(
      '--static-public-path-reset --static-public-path /new-public'
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-serve-index"', async () => {
    const { exitCode, stderr } = await testBin('--static-serve-index');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--no-static-serve-index"', async () => {
    const { exitCode, stderr } = await testBin('--no-static-serve-index');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--static-watch"', async () => {
    const { exitCode, stderr } = await testBin('--static-watch');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('should work using "--no-static-watch"', async () => {
    const { exitCode, stderr } = await testBin('--no-static-watch');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });
});
