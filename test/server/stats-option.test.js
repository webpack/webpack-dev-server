'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');

describe('stats option', () => {
  it(`should works with difference stats values (contains 'hash', 'assets', 'warnings' and 'errors')`, async () => {
    const allStats = [
      {},
      // eslint-disable-next-line no-undefined
      undefined,
      false,
      'errors-only',
      {
        assets: false,
      },
    ];

    for (const stats of allStats) {
      const compiler = webpack(config);
      const server = new Server(compiler, { stats });

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        compiler.hooks.done.tap('webpack-dev-server', (s) => {
          expect(Object.keys(server.getStats(s))).toMatchSnapshot();

          server.close(resolve);
        });

        compiler.run(() => {});
        server.listen(8080, 'localhost');
      });
    }
  });

  it('should respect warningsFilter', (done) => {
    const compiler = webpack(config);
    const server = new Server(compiler, {
      stats: { warningsFilter: 'test' },
    });

    compiler.hooks.done.tap('webpack-dev-server', (s) => {
      s.compilation.warnings = ['test', 'another warning'];

      const output = server.getStats(s);

      expect(output.warnings.length).toBe(1);
      expect(output.warnings[0]).toBe('another warning');

      server.close(done);
    });

    compiler.run(() => {});
    server.listen(8080, 'localhost');
  });
});
