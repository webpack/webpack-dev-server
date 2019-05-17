'use strict';

const { join } = require('path');
const ValidationError = require('schema-utils/src/ValidationError');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
const Server = require('../lib/Server');
const options = require('../lib/options.json');
const config = require('./fixtures/simple-config/webpack.config');

describe('options', () => {
  it('should match properties and errorMessage', () => {
    const properties = Object.keys(options.properties);
    const messages = Object.keys(options.errorMessage.properties);

    expect(properties.length).toEqual(messages.length);

    const res = properties.every((name) => messages.includes(name));

    expect(res).toEqual(true);
  });

  describe('validation', () => {
    let server;

    afterAll((done) => {
      if (server) {
        server.close(() => {
          done();
        });
      }
    });

    function validateOption(propertyName, cases) {
      const successCount = cases.success.length;
      const testCases = [];

      for (const key of Object.keys(cases)) {
        testCases.push(...cases[key]);
      }

      let current = 0;

      return testCases.reduce((p, value) => {
        let compiler = webpack(config);

        return p
          .then(() => {
            const opts =
              Object.prototype.toString.call(value) === '[object Object]' &&
              Object.keys(value) !== 0
                ? value
                : {
                    [propertyName]: value,
                  };

            server = new Server(compiler, opts);
          })
          .then(() => {
            if (current <= successCount) {
              expect(true).toBeTruthy();
            } else {
              expect(false).toBeTruthy();
            }
          })
          .catch((err) => {
            if (current >= successCount) {
              expect(err).toBeInstanceOf(ValidationError);
            } else {
              expect(false).toBeTruthy();
            }
          })
          .then(() => {
            return new Promise((resolve) => {
              if (server) {
                server.close(() => {
                  compiler = null;
                  server = null;
                  resolve();
                });
              } else {
                resolve();
              }
            });
          })
          .then(() => {
            current += 1;
          });
      }, Promise.resolve());
    }

    const memfs = createFsFromVolume(new Volume());
    // We need to patch memfs
    // https://github.com/webpack/webpack-dev-middleware#fs
    memfs.join = join;

    const cases = {
      after: {
        success: [() => {}],
        failure: [false],
      },
      before: {
        success: [() => {}],
        failure: [false],
      },
      allowedHosts: {
        success: [[], ['']],
        failure: [[false], false],
      },
      bonjour: {
        success: [false],
        failure: [''],
      },
      ca: {
        success: ['', Buffer.from('')],
        failure: [false],
      },
      cert: {
        success: ['', Buffer.from('')],
        failure: [false],
      },
      clientLogLevel: {
        success: [
          'silent',
          'info',
          'error',
          'warn',
          'trace',
          'debug',
          // deprecated
          'none',
          // deprecated
          'warning',
        ],
        failure: ['whoops!'],
      },
      compress: {
        success: [true],
        failure: [''],
      },
      contentBase: {
        success: [0, '.', false],
        failure: [[1], [false]],
      },
      disableHostCheck: {
        success: [true],
        failure: [''],
      },
      features: {
        success: [['before'], []],
        failure: [false],
      },
      filename: {
        success: ['', new RegExp(''), () => {}],
        failure: [false],
      },
      fs: {
        success: [
          {
            fs: memfs,
          },
        ],
        failure: [false],
      },
      headers: {
        success: [{}],
        failure: [false],
      },
      historyApiFallback: {
        success: [{}, true],
        failure: [''],
      },
      host: {
        success: ['', null],
        failure: [false],
      },
      hot: {
        success: [true],
        failure: [''],
      },
      hotOnly: {
        success: [true],
        failure: [''],
      },
      http2: {
        success: [true],
        failure: [''],
      },
      https: {
        success: [true, {}],
        failure: [''],
      },
      index: {
        success: [''],
        failure: [false],
      },
      injectClient: {
        success: [true, () => {}],
        failure: [''],
      },
      injectHot: {
        success: [true, () => {}],
        failure: [''],
      },
      inline: {
        success: [true],
        failure: [''],
      },
      key: {
        success: ['', Buffer.from('')],
        failure: [false],
      },
      lazy: {
        success: [
          {
            lazy: true,
            filename: '.',
          },
        ],
        failure: [
          {
            lazy: '',
            filename: '.',
          },
        ],
      },
      log: {
        success: [() => {}],
        failure: [''],
      },
      logLevel: {
        success: ['silent', 'info', 'error', 'warn', 'trace', 'debug'],
        failure: [false],
      },
      logTime: {
        success: [true],
        failure: [''],
      },
      mimeTypes: {
        success: [{}],
        failure: [false],
      },
      noInfo: {
        success: [true],
        failure: [''],
      },
      open: {
        success: [true, ''],
        failure: [{}],
      },
      openPage: {
        success: [''],
        failure: [false],
      },
      overlay: {
        success: [
          true,
          {},
          {
            overlay: {
              errors: true,
            },
          },
          {
            overlay: {
              warnings: true,
            },
          },
          {
            overlay: {
              arbitrary: '',
            },
          },
        ],
        failure: [
          '',
          {
            overlay: {
              errors: '',
            },
          },
          {
            overlay: {
              warnings: '',
            },
          },
        ],
      },
      pfx: {
        success: ['', Buffer.from('')],
        failure: [false],
      },
      pfxPassphrase: {
        success: [''],
        failure: [false],
      },
      port: {
        success: ['', 0, null],
        failure: [false],
      },
      progress: {
        success: [false],
        failure: [''],
      },
      proxy: {
        success: [
          {
            proxy: {
              '/api': 'http://localhost:3000',
            },
          },
        ],
        failure: [[], () => {}, false],
      },
      public: {
        success: [''],
        failure: [false],
      },
      publicPath: {
        success: [''],
        failure: [false],
      },
      quiet: {
        success: [true],
        failure: [''],
      },
      reporter: {
        success: [() => {}],
        failure: [''],
      },
      requestCert: {
        success: [true],
        failure: [''],
      },
      serveIndex: {
        success: [true],
        failure: [''],
      },
      serverSideRender: {
        success: [true],
        failure: [''],
      },
      setup: {
        success: [() => {}],
        failure: [''],
      },
      socket: {
        success: [''],
        failure: [false],
      },
      sockHost: {
        success: [''],
        failure: [false],
      },
      sockPath: {
        success: [''],
        failure: [false],
      },
      sockPort: {
        success: ['', 0, null],
        failure: [false],
      },
      staticOptions: {
        success: [{}],
        failure: [false],
      },
      stats: {
        success: [
          true,
          {},
          'none',
          'errors-only',
          'errors-warnings',
          'minimal',
          'normal',
          'verbose',
        ],
        failure: [false, 'whoops!', null],
      },
      useLocalIp: {
        success: [false],
        failure: [''],
      },
      warn: {
        success: [() => {}],
        failure: [''],
      },
      watchContentBase: {
        success: [true],
        failure: [''],
      },
      watchOptions: {
        success: [{}],
        failure: [''],
      },
      writeToDisk: {
        success: [true, () => {}],
        failure: [''],
      },
    };

    Object.keys(cases).forEach((key) => {
      it(key, () => {
        return validateOption(key, cases[key]);
      });
    });
  });
});
