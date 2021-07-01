'use strict';

const { testBin } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-web-socket-server'];

describe('"webSocketServer" CLI option', () => {
  it('should work using "--web-socket-server sockjs"', async () => {
    const { exitCode } = await testBin([
      '--port',
      port,
      '--web-socket-server',
      'sockjs',
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--web-socket-server ws"', async () => {
    const { exitCode } = await testBin([
      '--port',
      port,
      '--web-socket-server',
      'ws',
    ]);

    expect(exitCode).toEqual(0);
  });
});
