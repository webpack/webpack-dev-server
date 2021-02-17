'use strict';

const testBin = require('../helpers/test-bin');
const isWebpack5 = require('../helpers/isWebpack5');

describe('DevServer', () => {
  const webpack5Test = isWebpack5 ? it : it.skip;

  it('should add devServer entry points to a single entry point', (done) => {
    testBin('--config ./test/fixtures/dev-server/default-config.js')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('client/default/index.js?');
        done();
      })
      .catch(done);
  });

  it('should add devServer entry points to a multi entry point object', (done) => {
    testBin(
      '--config ./test/fixtures/dev-server/multi-entry.js --stats=verbose'
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('client/default/index.js?');
        expect(output.stderr).toContain('foo.js');
        done();
      })
      .catch(done);
  });

  webpack5Test('should supports entry as descriptor', (done) => {
    testBin(
      '--config ./test/fixtures/entry-as-descriptor/webpack.config --stats detailed'
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('foo.js');
        done();
      })
      .catch(done);
  });

  it('should only prepends devServer entry points to "web" target', (done) => {
    testBin(
      '--config ./test/fixtures/dev-server/default-config.js --target web'
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('client/default/index.js?');
        expect(output.stderr).toContain('foo.js');
        done();
      })
      .catch(done);
  });

  it('should not prepend devServer entry points to "node" target', (done) => {
    testBin(
      '--config ./test/fixtures/dev-server/default-config.js --target node'
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).not.toContain('client/default/index.js?');
        expect(output.stderr).toContain('foo.js');
        done();
      })
      .catch(done);
  });

  it('should prepends the hot runtime to "node" target as well', (done) => {
    testBin(
      '--config ./test/fixtures/dev-server/default-config.js --target node --hot'
    )
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('webpack/hot/dev-server');
        done();
      })
      .catch(done);
  });

  it('does not use client.path when default', (done) => {
    testBin('--config ./test/fixtures/dev-server/client-default-path-config.js')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).not.toContain('&path=/ws');
        done();
      })
      .catch(done);
  });

  it('should use client.path when custom', (done) => {
    testBin('--config ./test/fixtures/dev-server/client-custom-path-config.js')
      .then((output) => {
        expect(output.exitCode).toEqual(0);
        expect(output.stderr).toContain('&path=/custom/path');
        done();
      })
      .catch(done);
  });

  webpack5Test(
    'should prepend devServer entry points depending on targetProperties',
    (done) => {
      testBin('--config ./test/fixtures/dev-server/target-config.js')
        .then((output) => {
          expect(output.exitCode).toEqual(0);
          expect(output.stderr).toContain('client/default/index.js');
          done();
        })
        .catch(done);
    }
  );
});
