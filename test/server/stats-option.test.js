'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['stats-option'];

const createServer = (compiler, options) => new Server(options, compiler);

describe('stats option', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  it(`should works with difference stats values (contains 'hash', 'assets', 'warnings' and 'errors')`, () => {
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

    return allStats.reduce(
      (p, stats) =>
        p.then(
          () =>
            new Promise((resolve) => {
              const compiler = webpack(Object.assign({}, config, { stats }));
              const server = createServer(compiler, { static: false, port });

              compiler.hooks.done.tap('webpack-dev-server', (s) => {
                expect(
                  Object.keys(server.getStats(s)).sort()
                ).toMatchSnapshot();

                server.close(resolve);
              });

              compiler.run(() => {});
              server.listen(port, 'localhost');
            })
        ),
      Promise.resolve()
    );
  });

  it('should respect warningsFilter', (done) => {
    const compiler = webpack(
      Object.assign({}, config, {
        stats: { warningsFilter: 'test' },
      })
    );
    const server = createServer(compiler, { static: false, port });

    compiler.hooks.done.tap('webpack-dev-server', (s) => {
      s.compilation.warnings = ['test', 'another warning'];

      const output = server.getStats(s);

      expect(output.warnings.length).toBe(1);

      // Webpack@4
      if (typeof output.warnings[0] === 'string') {
        expect(output.warnings[0]).toBe('another warning');
      }
      // Webpack@5
      else {
        expect(output.warnings[0]).toEqual({ message: 'another warning' });
      }

      server.close(done);
    });

    compiler.run(() => {});
    server.listen(port, 'localhost');
  });
});
