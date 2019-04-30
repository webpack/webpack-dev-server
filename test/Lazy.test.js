'use strict';

const helper = require('./helper');
const config = require('./fixtures/simple-config/webpack.config');

describe('Lazy', () => {
  afterEach(helper.close);

  it('without filename option it should throw an error', () => {
    expect(() => {
      helper.start(config, {
        lazy: true,
      });
    }).toThrow(/'filename' option must be set/);
  });

  it('with filename option should not throw an error', (done) => {
    helper.startBeforeCompilation(
      config,
      {
        lazy: true,
        filename: 'bundle.js',
      },
      done
    );
  });
});
