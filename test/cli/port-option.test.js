'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('"port" CLI option', () => {
  it('should work using "--port <string>"', async () => {
    const { exitCode, stderr } = await testBin(['--port', '8080']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it(`should work using "--port auto"`, async () => {
    const { exitCode, stderr } = await testBin(['--port', 'auto']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });
});
