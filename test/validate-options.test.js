'use strict';

const path = require('path');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
const Server = require('../lib/Server');
const SockJSServer = require('../lib/servers/SockJSServer');
const config = require('./fixtures/simple-config/webpack.config');

describe('options', () => {
  jest.setTimeout(20000);

  let consoleMock;

  beforeAll(() => {
    consoleMock = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterAll(() => {
    consoleMock.mockRestore();
  });

  // We need to patch memfs
  // https://github.com/webpack/webpack-dev-middleware#fs
  const outputFileSystem = createFsFromVolume(new Volume());
  // Todo remove when we drop webpack@4 support
  outputFileSystem.join = path.join.bind(path);

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
    clientLogLevel: {
      success: ['silent', 'info', 'error', 'warn', 'trace', 'debug'],
      failure: ['whoops!', 'none', 'warning'],
    },
    compress: {
      success: [true],
      failure: [''],
    },
    contentBase: {
      success: ['./directory', false, ['./directory', './other-directory']],
      failure: [[1], [false]],
    },
    disableHostCheck: {
      success: [true],
      failure: [''],
    },
    filename: {
      success: ['', new RegExp(''), () => {}],
      failure: [false],
    },
    fs: {
      success: [outputFileSystem],
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
    lazy: {
      success: [true],
      failure: [''],
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
    onListening: {
      success: [() => {}],
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
        { errors: true },
        { warnings: true },
        { arbitrary: '' },
      ],
      failure: [
        '',
        {
          errors: 'test',
        },
        { warnings: 'test' },
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
    reporter: {
      success: [() => {}],
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
      failure: ['whoops!', null],
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
    stdin: {
      success: [false],
      failure: [''],
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

  function stringifyValue(value) {
    if (
      Array.isArray(value) ||
      (value && typeof value === 'object' && value.constructor === Object)
    ) {
      return JSON.stringify(value);
    }

    return value;
  }

  async function closeServer(server) {
    await new Promise((resolve) => {
      if (server) {
        server.close(resolve);
      } else {
        resolve();
      }
    });
  }

  async function createTestCase(key, value, type) {
    it(`should ${
      type === 'success' ? 'successfully validate' : 'throw an error on'
    } the "${key}" option with "${stringifyValue(value)}" value`, async () => {
      let server;
      let error;

      const compiler = webpack(config);
      const optionsForServer =
        key === 'lazy'
          ? { [key]: value, filename: 'filename' }
          : { [key]: value };

      try {
        server = new Server(compiler, optionsForServer);
      } catch (maybeError) {
        if (maybeError.name !== 'ValidationError') {
          throw maybeError;
        }

        error = maybeError;
      } finally {
        if (type === 'success') {
          expect(error).toBeUndefined();
        } else if (type === 'failure') {
          expect(() => {
            throw error;
          }).toThrowErrorMatchingSnapshot();
        }

        await closeServer(server);
      }
    });
  }

  for (const [key, values] of Object.entries(cases)) {
    for (const type of Object.keys(values)) {
      for (const value of values[type]) {
        createTestCase(key, value, type);
      }
    }
  }
});
