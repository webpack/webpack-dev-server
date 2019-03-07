'use strict';

const webpack = require('webpack');
const Server = require('../lib/Server');
const config = require('./fixtures/simple-config/webpack.config');

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

describe('Server', () => {
  it(`should cascade stats options`, () => {
    return new Promise((resolve, reject) => {
      (function iterate(stats, i) {
        if (i === allStats.length) {
          return resolve();
        }

        const prom = new Promise((res, rej) => {
          const compiler = webpack(config);
          const server = new Server(compiler, { stats });

          compiler.hooks.done.tap('webpack-dev-server', (s) => {
            const finalStats = JSON.stringify(server.getStats(s));
            const defaultStats = JSON.stringify(
              server._stats.toJson(Server.DEFAULT_STATS)
            );

            // If we're not over-riding stats configuration,
            // we get the same result as the DEFAULT_STATS
            if (!stats || !Object.keys(stats).length) {
              try {
                expect(finalStats).toBe(defaultStats);
              } catch (e) {
                rej(e);
              }
            } else {
              try {
                expect(finalStats).not.toBe(defaultStats);
              } catch (e) {
                rej(e);
              }
            }

            server.close(() => {
              res();
            });
          });

          compiler.run(() => {});
          server.listen(8080, 'localhost');
        });

        // Iterate to cover each case.
        prom
          .then(() => {
            i += 1;
            iterate(allStats[i], i);
          })
          .catch((e) => {
            reject(e);
          });
      })(allStats[0], 0);
    });
  });
});
