'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');
const isWebpack5 = require('../helpers/isWebpack5');

describe('DevServer', () => {
  const webpack5Test = isWebpack5 ? it : it.skip;

  it('should add devServer entry points to a single entry point', (done) => {
    testBin(null, './test/fixtures/dev-server/default-config.js')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('client/index.js?');
        done();
      })
      .catch(done);
  });

  webpack5Test(
    'should add devServer entry points to a multi entry point object',
    (done) => {
      testBin('--stats=verbose', './test/fixtures/dev-server/multi-entry.js')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(output.stdout).toContain('client/index.js?');
          expect(output.stdout).toContain('foo.js');
          done();
        })
        .catch(done);
    }
  );

  webpack5Test(
    'should add devServer entry points to an empty entry object',
    (done) => {
      testBin(null, './test/fixtures/dev-server/empty-entry.js')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(output.stdout).toContain('client/index.js?');
          done();
        })
        .catch(done);
    }
  );

  webpack5Test('should supports entry as descriptor', (done) => {
    testBin(
      '--stats detailed',
      './test/fixtures/entry-as-descriptor/webpack.config'
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('foo.js');
        done();
      })
      .catch(done);
  });

  it('should only prepends devServer entry points to "web" target', (done) => {
    testBin('--target web', './test/fixtures/dev-server/default-config.js')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('client/index.js?');
        expect(output.stdout).toContain('foo.js');
        done();
      })
      .catch(done);
  });

  it('should not prepend devServer entry points to "node" target', (done) => {
    testBin('--target node', './test/fixtures/dev-server/default-config.js')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).not.toContain('client/index.js?');
        expect(output.stdout).toContain('foo.js');
        done();
      })
      .catch(done);
  });

  it('should prepends the hot runtime to "node" target as well', (done) => {
    testBin(
      '--target node --hot',
      './test/fixtures/dev-server/default-config.js'
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('webpack/hot/dev-server');
        done();
      })
      .catch(done);
  });

  it('should "/ws" web socket path by default', (done) => {
    testBin(null, './test/fixtures/dev-server/client-default-path-config.js')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('ws%3A%2F%2F0.0.0.0%2Fws');
        done();
      })
      .catch(done);
  });

  it('should use client.path when custom', (done) => {
    testBin(null, './test/fixtures/dev-server/client-custom-path-config.js')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stdout).toContain('ws%3A%2F%2F0.0.0.0%2Fcustom%2Fpath');
        done();
      })
      .catch(done);
  });

  webpack5Test(
    'should prepend devServer entry points depending on targetProperties',
    (done) => {
      testBin(null, './test/fixtures/dev-server/target-config.js')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(output.stdout).toContain('client/index.js');
          done();
        })
        .catch(done);
    }
  );

  it('should show a warning for live reloading with non-web target', (done) => {
    testBin(
      '--target node --live-reload',
      './test/fixtures/dev-server/default-config.js'
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(
          normalizeStderr(output.stderr, { ipv6: true })
        ).toMatchSnapshot();

        done();
      })
      .catch(done);
  });
});
