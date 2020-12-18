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
        server.close(done);
      } else {
        done();
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

            if (typeof opts.static === 'undefined') {
              opts.static = false;
            }

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
          .then(
            () =>
              new Promise((resolve) => {
                if (server) {
                  server.close(() => {
                    compiler = null;
                    server = null;
                    resolve();
                  });
                } else {
                  resolve();
                }
              })
          )
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
      bonjour: {
        success: [false],
        failure: [''],
      },
      client: {
        success: [
          {
            client: {},
          },
          {
            client: {
              host: '',
            },
          },
          {
            client: {
              path: '',
            },
          },
          {
            client: {
              port: '',
            },
          },
          {
            client: {
              logging: 'none',
            },
          },
          {
            client: {
              logging: 'error',
            },
          },
          {
            client: {
              logging: 'warn',
            },
          },
          {
            client: {
              logging: 'info',
            },
          },
          {
            client: {
              logging: 'log',
            },
          },
          {
            client: {
              logging: 'verbose',
            },
          },
          {
            client: {
              host: '',
              path: '',
              port: 8080,
              logging: 'none',
            },
          },
          {
            client: {
              host: '',
              path: '',
              port: '',
            },
          },
          {
            client: {
              host: '',
              path: '',
              port: null,
            },
          },
          {
            client: {
              progress: false,
            },
          },
          {
            client: {
              overlay: true,
            },
          },
          {
            client: {
              overlay: {},
            },
          },
          {
            client: {
              overlay: {
                error: true,
              },
            },
          },
          {
            client: {
              overlay: {
                warnings: true,
              },
            },
          },
          {
            client: {
              overlay: {
                arbitrary: '',
              },
            },
          },
        ],
        failure: [
          'whoops!',
          {
            client: {
              unknownOption: true,
            },
          },
          {
            client: {
              host: true,
              path: '',
              port: 8080,
            },
          },
          {
            client: {
              logging: 'whoops!',
            },
          },
          {
            client: {
              logging: 'silent',
            },
          },
          {
            client: {
              progress: '',
            },
          },
          {
            client: {
              overlay: '',
            },
          },
          {
            client: {
              overlay: {
                errors: '',
              },
            },
          },
          {
            client: {
              overlay: {
                warnings: '',
              },
            },
          },
        ],
      },
      compress: {
        success: [true],
        failure: [''],
      },
      dev: {
        success: [
          {
            dev: {},
          },
        ],
        failure: [''],
      },
      firewall: {
        success: [true, false, ['']],
        failure: ['', []],
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
      injectClient: {
        success: [true, () => {}],
        failure: [''],
      },
      injectHot: {
        success: [true, () => {}],
        failure: [''],
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
      port: {
        success: ['', 0, null],
        failure: [false],
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
      static: {
        success: [
          'path',
          false,
          {
            static: {
              directory: 'path',
              staticOptions: {},
              publicPath: '/',
              serveIndex: true,
              watch: true,
            },
          },
          {
            static: {
              directory: 'path',
              staticOptions: {},
              publicPath: ['/public1/', '/public2/'],
              serveIndex: {},
              watch: {},
            },
          },
          {
            static: [
              'path1',
              {
                directory: 'path2',
                staticOptions: {},
                publicPath: '/',
                serveIndex: true,
                watch: true,
              },
            ],
          },
        ],
        failure: [0, null, ''],
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
    };

    Object.keys(cases).forEach((key) => {
      it(key, () => validateOption(key, cases[key]));
    });
  });
});
