'use strict';

const assert = require('assert');
const patchPublicPath = require('../lib/utils/patchPublicPath');

describe('PublicPath', () => {
  it('uses config output by default', () => {
    const config = {
      output: { publicPath: '/abc/' }
    };
    const devServerOptions = {};

    patchPublicPath(config, devServerOptions);

    assert.equal('/abc/', config.output.publicPath);
  });

  it('overrides the domain', () => {
    const config = {
      output: { public: 'example.com', publicPath: '/abc/' }
    };
    const devServerOptions = {
      public: 'somewhereelse.com:9999'
    };

    patchPublicPath(config, devServerOptions);

    assert.equal('http://somewhereelse.com:9999/abc/', config.output.publicPath);
  });

  it('overrides the publicPath', () => {
    const config = {
      output: { public: 'example.com', publicPath: '/original/' }
    };
    const devServerOptions = {
      public: 'somewhereelse.com:9999',
      publicPath: '/patched/'
    };

    patchPublicPath(config, devServerOptions);

    assert.equal('http://somewhereelse.com:9999/patched/', config.output.publicPath);
  });
});
