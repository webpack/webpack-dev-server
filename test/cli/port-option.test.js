'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('"port" CLI option', () => {
  it('--port is string', async () => {
    const { exitCode, stderr } = await testBin(['--port', '8080']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it(`--port is auto`, async () => {
    const { exitCode, stderr } = await testBin(['--port', 'auto']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });
});
