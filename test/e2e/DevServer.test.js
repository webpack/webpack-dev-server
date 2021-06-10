'use strict';

const { testBin } = require('../helpers/test-bin');
const isWebpack5 = require('../helpers/isWebpack5');

describe('DevServer', () => {
  const webpack5Test = isWebpack5 ? it : it.skip;

  it('should add devServer entry points to a single entry point', async () => {
    const { exitCode, stdout } = await testBin(
      null,
      './test/fixtures/dev-server/default-config.js'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('client/index.js?');
  });

  webpack5Test(
    'should add devServer entry points to a multi entry point object',
    async () => {
      const { exitCode, stdout } = await testBin(
        '--stats=verbose',
        './test/fixtures/dev-server/multi-entry.js'
      );

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('client/index.js?');
      expect(stdout).toContain('foo.js');
    }
  );

  webpack5Test(
    'should add devServer entry points to an empty entry object',
    async () => {
      const { exitCode, stdout } = await testBin(
        null,
        './test/fixtures/dev-server/empty-entry.js'
      );

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('client/index.js?');
    }
  );

  webpack5Test('should supports entry as descriptor', async () => {
    const { exitCode, stdout } = await testBin(
      '--stats=detailed',
      './test/fixtures/entry-as-descriptor/webpack.config'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('foo.js');
  });

  it('should only prepends devServer entry points to "web" target', async () => {
    const { exitCode, stdout } = await testBin(
      '--target web',
      './test/fixtures/dev-server/default-config.js'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('client/index.js?');
    expect(stdout).toContain('foo.js');
  });

  it('should not prepend devServer entry points to "node" target', async () => {
    const { exitCode, stdout } = await testBin(
      '--target node',
      './test/fixtures/dev-server/default-config.js'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('client/index.js?');
    expect(stdout).toContain('foo.js');
  });

  it('should prepends the hot runtime to "node" target as well', async () => {
    const { exitCode, stdout } = await testBin(
      '--target node --hot',
      './test/fixtures/dev-server/default-config.js'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('webpack/hot/dev-server');
  });

  it('should "/ws" web socket path by default', async () => {
    const { exitCode, stdout } = await testBin(
      null,
      './test/fixtures/dev-server/client-default-path-config.js'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('ws%3A%2F%2F0.0.0.0%2Fws');
  });

  it('should use client.path when custom', async () => {
    const { exitCode, stdout } = await testBin(
      null,
      './test/fixtures/dev-server/client-custom-path-config.js'
    );

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('ws%3A%2F%2F0.0.0.0%2Fcustom%2Fpath');
  });

  webpack5Test(
    'should prepend devServer entry points depending on targetProperties',
    async () => {
      const { exitCode, stdout } = await testBin(
        null,
        './test/fixtures/dev-server/target-config.js'
      );

      expect(exitCode).toEqual(0);
      expect(stdout).toContain('client/index.js');
    }
  );
});
