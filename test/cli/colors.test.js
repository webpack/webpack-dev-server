'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

const colorsDefaultStats = require.resolve(
  '../fixtures/cli-colors-default-stats/webpack.config'
);
const colorsDisabled = require.resolve(
  '../fixtures/cli-colors-disabled/webpack.config'
);
const colorsEnabled = require.resolve(
  '../fixtures/cli-colors-enabled/webpack.config'
);

describe('colors', () => {
  it('should work use colors by default', async () => {
    const { exitCode, stderr, stdout } = await testBin(
      '--color',
      colorsDefaultStats
    );

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    expect(stdout).toContain('\x1b[1m');
  });

  it('should work use colors using "--color"', async () => {
    const { exitCode, stderr, stdout } = await testBin('--color');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    expect(stdout).toContain('\x1b[1m');
  });

  it('should work do not use colors using "--no-color"', async () => {
    const { exitCode, stderr, stdout } = await testBin('--no-color');

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    expect(stdout).not.toContain('\x1b[1m');
  });

  it('should work use colors using configuration with enabled colors', async () => {
    const { exitCode, stderr, stdout } = await testBin('', colorsEnabled);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    expect(stdout).toContain('\x1b[1m');
  });

  it('should work and do not use colors using configuration with disabled colors', async () => {
    const { exitCode, stderr, stdout } = await testBin('', colorsDisabled);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
    expect(stdout).not.toContain('\x1b[1m');
  });
});
