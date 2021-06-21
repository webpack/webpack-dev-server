'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"client" CLI option', () => {
  it('should work using "--client-transport sockjs"', async () => {
    const { exitCode } = await testBin(['--client-transport', 'sockjs']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-transport ws"', async () => {
    const { exitCode } = await testBin(['--client-transport', 'ws']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-overlay"', async () => {
    const { exitCode } = await testBin(['--client-overlay']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-client-overlay"', async () => {
    const { exitCode } = await testBin(['--no-client-overlay']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-overlay-errors"', async () => {
    const { exitCode } = await testBin(['--client-overlay-errors']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-client-overlay-errors"', async () => {
    const { exitCode } = await testBin(['--no-client-overlay-errors']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-overlay-warnings"', async () => {
    const { exitCode } = await testBin(['--client-overlay-warnings']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-client-overlay-warnings"', async () => {
    const { exitCode } = await testBin(['--no-client-overlay-warnings']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-need-client-entry"', async () => {
    const { exitCode, stdout } = await testBin([
      '--client-need-client-entry',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('client/index.js');
  });

  it('should work using "--no-client-need-client-entry"', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-client-need-client-entry',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('client/index.js');
  });

  it('should work using "--client-logging"', async () => {
    const { exitCode } = await testBin(['--client-logging', 'verbose']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-progress"', async () => {
    const { exitCode } = await testBin(['--client-progress']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-client-progress"', async () => {
    const { exitCode } = await testBin(['--no-client-progress']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-hot-entry"', async () => {
    const { exitCode, stdout } = await testBin([
      '--client-hot-entry',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('webpack/hot/dev-server.js');
  });

  it('should work using "--no-client-hot-entry"', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-client-hot-entry',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('should not inject HMR entry using "--client-hot-entry --no-hot"', async () => {
    const { exitCode, stdout } = await testBin([
      '--client-hot-entry',
      '--no-hot',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('should not inject HMR entry using "--no-client-hot-entry --hot"', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-client-hot-entry',
      '--hot',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('should work using "--client-web-socket-url"', async () => {
    const { exitCode } = await testBin([
      '--client-web-socket-url',
      'ws://myhost.com:8080/foo/test',
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-web-socket-url-protocol"', async () => {
    const { exitCode } = await testBin([
      '--client-web-socket-url-protocol',
      'ws:',
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-web-socket-url-hostname"', async () => {
    const { exitCode } = await testBin([
      '--client-web-socket-url-hostname',
      '0.0.0.0',
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-web-socket-url-path"', async () => {
    const { exitCode } = await testBin(['--client-web-socket-url-path', '/ws']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--client-web-socket-url-port"', async () => {
    const { exitCode } = await testBin(['--client-web-socket-url-port', 8080]);

    expect(exitCode).toEqual(0);
  });

  it('should add "/ws" web socket path by default', async () => {
    const { exitCode, stdout } = await testBin(
      null,
      './test/fixtures/dev-server/client-default-path-config.js'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('ws%3A%2F%2F0.0.0.0%2Fws');
  });

  it('should use "client.webSocketURL.path" from configuration', async () => {
    const { exitCode, stdout } = await testBin(
      null,
      './test/fixtures/dev-server/client-custom-path-config.js'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('ws%3A%2F%2F0.0.0.0%2Fcustom%2Fpath');
  });
});
