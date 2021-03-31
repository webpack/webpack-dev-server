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
            server = new Server(compiler, { [propertyName]: value });
          })
          .then(() => {
            if (current < successCount) {
              expect(true).toBeTruthy();
            } else {
              expect(false).toBeTruthy();
            }
          })
          .catch((err) => {
            if (propertyName === 'watchFiles') console.log(err);
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
        success: [false, true],
        failure: [''],
      },
      client: {
        success: [
          {},
          {
            host: '',
          },
          {
            path: '',
          },
          {
            port: '',
          },
          {
            logging: 'none',
          },
          {
            logging: 'error',
          },
          {
            logging: 'warn',
          },
          {
            logging: 'info',
          },
          {
            logging: 'log',
          },
          {
            logging: 'verbose',
          },
          {
            host: '',
            path: '',
            port: 8080,
            logging: 'none',
          },
          {
            host: '',
            path: '',
            port: '',
          },
          {
            host: '',
            path: '',
            port: null,
          },
          {
            progress: false,
          },
          {
            overlay: true,
          },
          {
            overlay: {},
          },
          {
            overlay: {
              error: true,
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
          {
            needClientEntry: true,
          },
          {
            needHotEntry: true,
          },
        ],
        failure: [
          'whoops!',
          {
            unknownOption: true,
          },
          {
            host: true,
            path: '',
            port: 8080,
          },
          {
            logging: 'whoops!',
          },
          {
            logging: 'silent',
          },
          {
            progress: '',
          },
          {
            overlay: '',
          },
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
          {
            needClientEntry: [''],
          },
          {
            needHotEntry: [''],
          },
        ],
      },
      compress: {
        success: [false, true],
        failure: [''],
      },
      dev: {
        success: [{}],
        failure: [''],
      },
      firewall: {
        success: [true, false, ['']],
        failure: ['', []],
      },
      headers: {
        success: [{}, { foo: 'bar' }],
        failure: [false],
      },
      historyApiFallback: {
        success: [{}, true],
        failure: [''],
      },
      host: {
        success: ['', 'localhost', null],
        failure: [false],
      },
      hot: {
        success: [true, 'only'],
        failure: ['', 'foo'],
      },
      http2: {
        success: [false, true],
        failure: [''],
      },
      https: {
        success: [
          false,
          true,
          {
            ca: join(httpsCertificateDirectory, 'ca.pem'),
            key: join(httpsCertificateDirectory, 'server.key'),
            pfx: join(httpsCertificateDirectory, 'server.pfx'),
            cert: join(httpsCertificateDirectory, 'server.crt'),
            requestCert: true,
            passphrase: 'webpack-dev-server',
          },
          {
            ca: readFileSync(join(httpsCertificateDirectory, 'ca.pem')),
            pfx: readFileSync(join(httpsCertificateDirectory, 'server.pfx')),
            key: readFileSync(join(httpsCertificateDirectory, 'server.key')),
            cert: readFileSync(join(httpsCertificateDirectory, 'server.crt')),
            passphrase: 'webpack-dev-server',
          },
        ],
        failure: [
          '',
          {
            foo: 'bar',
          },
        ],
      },
      onListening: {
        success: [() => {}],
        failure: [''],
      },
      open: {
        success: [
          true,
          'foo',
          ['foo', 'bar'],
          { target: true },
          { target: 'foo' },
          { target: ['foo', 'bar'] },
          { app: 'google-chrome' },
          { app: ['google-chrome', '--incognito'] },
          { target: 'foo', app: 'google-chrome' },
          { target: ['foo', 'bar'], app: ['google-chrome', '--incognito'] },
          {},
        ],
        failure: ['', [], { foo: 'bar' }],
      },
      port: {
        success: ['', 0, null],
        failure: [false],
      },
      proxy: {
        success: [
          {
            '/api': 'http://localhost:3000',
          },
        ],
        failure: [[], () => {}, false],
      },
      public: {
        success: ['', 'foo', 'auto'],
        failure: [false],
      },
      static: {
        success: [
          'path',
          false,
          {
            directory: 'path',
            staticOptions: {},
            publicPath: '/',
            serveIndex: true,
            watch: true,
          },
          {
            directory: 'path',
            staticOptions: {},
            publicPath: ['/public1/', '/public2/'],
            serveIndex: {},
            watch: {},
          },
          [
            'path1',
            {
              directory: 'path2',
              staticOptions: {},
              publicPath: '/',
              serveIndex: true,
              watch: true,
            },
          ],
        ],
        failure: [0, null, ''],
      },
      transportMode: {
        success: [
          'ws',
          'sockjs',
          {
            server: 'sockjs',
          },
          {
            server: require.resolve('../lib/servers/SockJSServer'),
          },
          {
            server: SockJSServer,
          },
          {
            client: 'sockjs',
          },
          {
            client: require.resolve('../client/clients/SockJSClient'),
          },
          {
            server: SockJSServer,
            client: require.resolve('../client/clients/SockJSClient'),
          },
        ],
        failure: [
          'nonexistent-implementation',
          null,
          {
            notAnOption: true,
          },
          {
            server: false,
          },
          {
            client: () => {},
          },
        ],
      },
      watchFiles: {
        success: ['', [''], { watchFiles: { paths: [''], options: {} } }],
        failure: [''],
      },
    };

    Object.keys(cases).forEach((key) => {
      it(key, () => validateOption(key, cases[key]));
    });
  });
});
