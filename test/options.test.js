'use strict';

const { readFileSync } = require('fs');
const { join } = require('path');
const { ValidationError } = require('schema-utils');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
const Server = require('../lib/Server');
const options = require('../lib/options.json');
const SockJSServer = require('../lib/servers/SockJSServer');
const config = require('./fixtures/simple-config/webpack.config');

const httpsCertificateDirectory = join(
  __dirname,
  './fixtures/https-certificate'
);

describe('options', () => {
  jest.setTimeout(20000);

  let consoleMock;

  beforeAll(() => {
    consoleMock = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterAll(() => {
    consoleMock.mockRestore();
  });

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
              Object.keys(value).length !== 0
                ? value
                : {
                    [propertyName]: value,
                  };

            server = new Server(compiler, opts);
          })
          .then(() => {
            if (current < successCount) {
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
      onAfterSetupMiddleware: {
        success: [() => {}],
        failure: [false],
      },
      onBeforeSetupMiddleware: {
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
      clientOptions: {
        success: [
          {
            clientOptions: {},
          },
          {
            clientOptions: {
              host: '',
            },
          },
          {
            clientOptions: {
              path: '',
            },
          },
          {
            clientOptions: {
              port: '',
            },
          },
          {
            clientOptions: {
              host: '',
              path: '',
              port: 8080,
            },
          },
          {
            clientOptions: {
              host: '',
              path: '',
              port: '',
            },
          },
          {
            clientOptions: {
              host: '',
              path: '',
              port: null,
            },
          },
        ],
        failure: [
          'whoops!',
          {
            clientOptions: {
              unknownOption: true,
            },
          },
          {
            clientOptions: {
              host: true,
              path: '',
              port: 8080,
            },
          },
        ],
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
        success: [true, 'only'],
        failure: ['', 'foo'],
      },
      http2: {
        success: [true],
        failure: [''],
      },
      https: {
        success: [
          false,
          {
            https: {
              ca: join(httpsCertificateDirectory, 'ca.pem'),
              key: join(httpsCertificateDirectory, 'server.key'),
              pfx: join(httpsCertificateDirectory, 'server.pfx'),
              cert: join(httpsCertificateDirectory, 'server.crt'),
              requestCert: true,
              passphrase: 'webpack-dev-server',
            },
          },
          {
            https: {
              ca: readFileSync(join(httpsCertificateDirectory, 'ca.pem')),
              pfx: readFileSync(join(httpsCertificateDirectory, 'server.pfx')),
              key: readFileSync(join(httpsCertificateDirectory, 'server.key')),
              cert: readFileSync(join(httpsCertificateDirectory, 'server.crt')),
              passphrase: 'webpack-dev-server',
            },
          },
        ],
        failure: [
          '',
          {
            https: {
              foo: 'bar',
            },
          },
        ],
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
      mimeTypes: {
        success: [{}],
        failure: [false],
      },
      onListening: {
        success: [() => {}],
        failure: [''],
      },
      open: {
        success: [true, '', {}],
        failure: [[]],
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
      port: {
        success: ['', 0, null],
        failure: [false],
      },
      profile: {
        success: [false],
        failure: [''],
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
      socket: {
        success: [''],
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
        failure: ['whoops!', null],
      },
      transportMode: {
        success: [
          'ws',
          'sockjs',
          {
            transportMode: {
              server: 'sockjs',
            },
          },
          {
            transportMode: {
              server: require.resolve('../lib/servers/SockJSServer'),
            },
          },
          {
            transportMode: {
              server: SockJSServer,
            },
          },
          {
            transportMode: {
              client: 'sockjs',
            },
          },
          {
            transportMode: {
              client: require.resolve('../client/clients/SockJSClient'),
            },
          },
          {
            transportMode: {
              server: SockJSServer,
              client: require.resolve('../client/clients/SockJSClient'),
            },
          },
        ],
        failure: [
          'nonexistent-implementation',
          null,
          {
            transportMode: {
              notAnOption: true,
            },
          },
          {
            transportMode: {
              server: false,
            },
          },
          {
            transportMode: {
              client: () => {},
            },
          },
        ],
      },
      useLocalIp: {
        success: [false],
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
