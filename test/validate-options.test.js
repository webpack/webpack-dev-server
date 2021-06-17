'use strict';

const { join } = require('path');
const { readFileSync } = require('graceful-fs');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
const Server = require('../lib/Server');
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
          errors: true,
        },
      },
      {
        overlay: {
          warnings: true,
        },
      },
      {
        needClientEntry: true,
      },
      {
        hotEntry: true,
      },
      {
        transport: 'sockjs',
      },
      {
        transport: require.resolve('../client/clients/SockJSClient'),
      },
      {
        webSocketURL: 'ws://localhost:8080',
      },
      {
        webSocketURL: { host: 'localhost' },
      },
      {
        webSocketURL: { port: 8080 },
      },
      {
        webSocketURL: { port: '8080' },
      },
      {
        webSocketURL: { path: '' },
      },
      {
        webSocketURL: { path: '/my-path/' },
      },
      {
        webSocketURL: { host: 'localhost', port: 8080, path: '/my-path/' },
      },
    ],
    failure: [
      'whoops!',
      {
        unknownOption: true,
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
        overlay: {
          arbitrary: '',
        },
      },
      {
        needClientEntry: [''],
      },
      {
        hotEntry: [''],
      },
      {
        transport: true,
      },
      {
        webSocketURL: { host: true, path: '', port: 8080 },
      },
      {
        webSocketURL: { path: true },
      },
      {
        webSocketURL: { port: true },
      },
      {
        webSocketURL: { host: '' },
      },
      {
        webSocketURL: { port: '' },
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
  allowedHosts: {
    success: ['auto', 'all', ['foo'], 'bar'],
    failure: [true, false, 123, [], ['']],
  },
  headers: {
    success: [{}, { foo: 'bar' }, () => {}],
    failure: [false, 1],
  },
  historyApiFallback: {
    success: [{}, true],
    failure: [''],
  },
  host: {
    success: ['localhost', '::', '::1'],
    failure: [false, '', null],
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
      {
        key: 10,
      },
      {
        cert: true,
      },
      {
        cacert: true,
      },
      {
        passphrase: false,
      },
      {
        pfx: 10,
      },
      {
        requestCert: 'test',
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
      [],
      ['foo', 'bar'],
      { target: true },
      { target: 'foo' },
      { target: ['foo', 'bar'] },
      { app: 'google-chrome' },
      { app: { name: 'google-chrome', arguments: ['--incognito'] } },
      { target: 'foo', app: 'google-chrome' },
      {
        target: ['foo', 'bar'],
        app: { name: 'google-chrome', arguments: ['--incognito'] },
      },
      {},
    ],
    failure: ['', { foo: 'bar' }, { target: 90 }, { app: true }],
  },
  port: {
    success: ['8080', 8080, 'auto'],
    failure: [false, null, ''],
  },
  proxy: {
    success: [
      [
        {
          context: ['/auth', '/api'],
          target: 'http://localhost:3000',
        },
      ],
      {
        '/api': 'http://localhost:3000',
      },
    ],
    failure: [() => {}, false],
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
      {
        directory: false,
      },
      {
        watch: 10,
      },
    ],
  },
  webSocketServer: {
    success: [
      'ws',
      'sockjs',
      {
        type: 'ws',
        options: {
          path: '/ws',
        },
      },
      {
        options: {
          host: '127.0.0.1',
          port: 8090,
          path: '/ws',
        },
      },
      {
        type: 'ws',
      },
    ],
    failure: [
      'nonexistent-implementation',
      null,
      false,
      {
        notAnOption: true,
      },
      {
        type: true,
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
          server = new Server({ [key]: value }, compiler);
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
