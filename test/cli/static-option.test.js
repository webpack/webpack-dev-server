'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('static option', () => {
  it('--static', async () => {
    const { exitCode, stderr } = await testBin('--static');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static <value>', async () => {
    const { exitCode, stderr } = await testBin('--static new-static');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static <value> --static <other-value>', async () => {
    const { exitCode, stderr } = await testBin(
      '--static new-static --static other-static'
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static-reset', async () => {
    const { exitCode, stderr } = await testBin(
      '--static-reset --static new-static-after-reset'
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static-reset --static-directory <value>', async () => {
    const { exitCode, stderr } = await testBin(
      '--static-reset --static-directory new-static-directory'
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static-directory', async () => {
    const { exitCode, stderr } = await testBin('--static-directory static-dir');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static-public-path', async () => {
    const { exitCode, stderr } = await testBin('--static-public-path /public');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static-public-path-reset', async () => {
    const { exitCode, stderr } = await testBin(
      '--static-public-path-reset --static-public-path /new-public'
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static-serve-index', async () => {
    const { exitCode, stderr } = await testBin('--static-serve-index');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--no-static-serve-index', async () => {
    const { exitCode, stderr } = await testBin('--no-static-serve-index');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--static-watch', async () => {
    const { exitCode, stderr } = await testBin('--static-watch');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--no-static-watch', async () => {
    const { exitCode, stderr } = await testBin('--no-static-watch');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });
});
