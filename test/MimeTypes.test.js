'use strict';

const helper = require('./helper');
const config = require('./fixtures/simple-config/webpack.config');

describe('MimeTypes', () => {
  afterEach(helper.close);

  it('remapping mime type without force should throw an error', () => {
    expect(() => {
      helper.start(config, {
        mimeTypes: { 'text/html': ['js'] },
      });
    }).toThrow(/Attempt to change mapping for/);
  });

  it('remapping mime type with force should not throw an error', (done) => {
    helper.start(
      config,
      {
        mimeTypes: {
          typeMap: { 'text/html': ['js'] },
          force: true,
        },
      },
      done
    );
  });
});
