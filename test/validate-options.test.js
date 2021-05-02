'use strict';

const { join } = require('path');
const { readFileSync } = require('graceful-fs');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
const Server = require('../lib/Server');
const SockJSServer = require('../lib/servers/SockJSServer');
const config = require('./fixtures/simple-config/webpack.config');

const httpsCertificateDirectory = join(
  __dirname,
  './fixtures/https-certificate'
);

const tests = {
  onAfterSetupMiddleware: {
    success: [() => {}],
    failure: [false],
  },
  onBeforeSetupMiddleware: {
    success: [() => {}],
    failure: [false],
  },
  bonjour: {
    success: [false, true, { type: 'https' }],
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
  devMiddleware: {
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
        cacert: join(httpsCertificateDirectory, 'ca.pem'),
        key: join(httpsCertificateDirectory, 'server.key'),
        pfx: join(httpsCertificateDirectory, 'server.pfx'),
        cert: join(httpsCertificateDirectory, 'server.crt'),
        requestCert: true,
        passphrase: 'webpack-dev-server',
      },
      {
        cacert: readFileSync(join(httpsCertificateDirectory, 'ca.pem')),
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
    failure: ['', [], { foo: 'bar' }, { target: 90 }, { app: true }],
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
    failure: [
      0,
      null,
      '',
      {
        publicPath: false,
      },
      {
        serveIndex: 'true',
      },
    ],
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
    success: [
      'dir',
      ['one-dir', 'two-dir'],
      { paths: ['dir'] },
      { paths: ['dir'], options: { usePolling: true } },
      [{ paths: ['one-dir'] }, 'two-dir'],
    ],
    failure: [false, 123],
  },
};

describe('options', () => {
  jest.setTimeout(20000);

  let consoleMock;

  beforeAll(() => {
    consoleMock = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterAll(() => {
    consoleMock.mockRestore();
  });

  describe('validate', () => {
    function stringifyValue(value) {
      if (
        Array.isArray(value) ||
        (value && typeof value === 'object' && value.constructor === Object)
      ) {
        return JSON.stringify(value, (_key, replacedValue) => {
          if (
            replacedValue &&
            replacedValue.type &&
            replacedValue.type === 'Buffer'
          ) {
            return '<Buffer>';
          }

          if (typeof replacedValue === 'string') {
            replacedValue = replacedValue
              .replace(/\\/g, '/')
              .replace(
                new RegExp(process.cwd().replace(/\\/g, '/'), 'g'),
                '<cwd>'
              );
          }

          return replacedValue;
        });
      }

      return value;
    }

    function createTestCase(type, key, value) {
      it(`should ${
        type === 'success' ? 'successfully validate' : 'throw an error on'
      } the "${key}" option with '${stringifyValue(value)}' value`, (done) => {
        let compiler = webpack(config);
        let server;
        let thrownError;

        try {
          server = new Server(compiler, { [key]: value });
        } catch (error) {
          thrownError = error;
        }

        if (type === 'success') {
          expect(thrownError).toBeUndefined();
        } else {
          expect(thrownError).not.toBeUndefined();
          expect(thrownError.toString()).toMatchSnapshot();
        }

        if (server) {
          server.close(() => {
            compiler = null;
            server = null;

            done();
          });
        } else {
          done();
        }
      });
    }

    const memfs = createFsFromVolume(new Volume());

    // We need to patch memfs
    // https://github.com/webpack/webpack-dev-middleware#fs
    memfs.join = join;

    for (const [key, values] of Object.entries(tests)) {
      for (const type of Object.keys(values)) {
        for (const value of values[type]) {
          createTestCase(type, key, value);
        }
      }
    }
  });
});
