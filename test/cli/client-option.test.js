'use strict';

const { testBin } = require('../helpers/test-bin');

describe('client option', () => {
  it('--client-transport sockjs', async () => {
    const { exitCode } = await testBin(['--client-transport', 'sockjs']);

    expect(exitCode).toEqual(0);
  });

  it('--client-transport ws', async () => {
    const { exitCode } = await testBin(['--client-transport', 'ws']);

    expect(exitCode).toEqual(0);
  });

  it('--client-overlay', async () => {
    const { exitCode } = await testBin(['--client-overlay']);

    expect(exitCode).toEqual(0);
  });

  it('--no-client-overlay', async () => {
    const { exitCode } = await testBin(['--no-client-overlay']);

    expect(exitCode).toEqual(0);
  });

  it('--client-overlay-errors', async () => {
    const { exitCode } = await testBin(['--client-overlay-errors']);

    expect(exitCode).toEqual(0);
  });

  it('--no-client-overlay-errors', async () => {
    const { exitCode } = await testBin(['--no-client-overlay-errors']);

    expect(exitCode).toEqual(0);
  });

  it('--client-overlay-warnings', async () => {
    const { exitCode } = await testBin(['--client-overlay-warnings']);

    expect(exitCode).toEqual(0);
  });

  it('--no-client-overlay-warnings', async () => {
    const { exitCode } = await testBin(['--no-client-overlay-warnings']);

    expect(exitCode).toEqual(0);
  });

  it('--client-need-client-entry', async () => {
    const { exitCode, stdout } = await testBin([
      '--client-need-client-entry',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('client/index.js');
  });

  it('--no-client-need-client-entry', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-client-need-client-entry',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('client/index.js');
  });

  it('--client-logging', async () => {
    const { exitCode } = await testBin(['--client-logging', 'verbose']);

    expect(exitCode).toEqual(0);
  });

  it('--client-progress', async () => {
    const { exitCode } = await testBin(['--client-progress']);

    expect(exitCode).toEqual(0);
  });

  it('--no-client-progress', async () => {
    const { exitCode } = await testBin(['--no-client-progress']);

    expect(exitCode).toEqual(0);
  });

  it('--client-hot-entry', async () => {
    const { exitCode, stdout } = await testBin([
      '--client-hot-entry',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('webpack/hot/dev-server.js');
  });

  it('--no-client-hot-entry', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-client-hot-entry',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('should not inject HMR entry "--client-hot-entry" and "--no-hot"', async () => {
    const { exitCode, stdout } = await testBin([
      '--client-hot-entry',
      '--no-hot',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('should not inject HMR entry with "--no-client-hot-entry" and "--hot"', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-client-hot-entry',
      '--hot',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('--client-web-socket-url', async () => {
    const { exitCode } = await testBin([
      '--client-web-socket-url',
      'ws://myhost.com:8080/foo/test',
    ]);

    expect(exitCode).toEqual(0);
  });

  it('--client-web-socket-url-protocol', async () => {
    const { exitCode } = await testBin([
      '--client-web-socket-url-protocol',
      'ws:',
    ]);

    expect(exitCode).toEqual(0);
  });

  it('--client-web-socket-url-host', async () => {
    const { exitCode } = await testBin([
      '--client-web-socket-url-host',
      '0.0.0.0',
    ]);

    expect(exitCode).toEqual(0);
  });

  it('--client-web-socket-url-path', async () => {
    const { exitCode } = await testBin(['--client-web-socket-url-path', '/ws']);

    expect(exitCode).toEqual(0);
  });

  it('--client-web-socket-url-port', async () => {
    const { exitCode } = await testBin(['--client-web-socket-url-port', 8080]);

    expect(exitCode).toEqual(0);
  });
});
