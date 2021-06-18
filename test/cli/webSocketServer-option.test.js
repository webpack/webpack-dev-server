'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"webSocketServer" CLI option', () => {
  it('should work using "--web-socket-server sockjs"', async () => {
    const { exitCode } = await testBin(['--web-socket-server', 'sockjs']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--web-socket-server ws"', async () => {
    const { exitCode } = await testBin(['--web-socket-server', 'ws']);

    expect(exitCode).toEqual(0);
  });
});
