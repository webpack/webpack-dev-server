'use strict';

const path = require('path');
const webpack = require('webpack');
const normalizeOptions = require('../../../lib/utils/normalizeOptions');

describe('normalizeOptions', () => {
  const cases = [
    {
      title: 'no options',
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },
    {
      title: 'client.transport sockjs string',
      multiCompiler: false,
      options: {
        client: {
          transport: 'sockjs',
        },
      },
      optionsResults: null,
    },
    {
      title: 'client.transport ws string',
      multiCompiler: false,
      options: {
        client: {
          transport: 'ws',
        },
      },
      optionsResults: null,
    },
    {
      title: 'client.transport ws string and webSocketServer ws string',
      multiCompiler: false,
      options: {
        client: {
          transport: 'ws',
        },
        webSocketServer: 'ws',
      },
      optionsResults: null,
    },
    {
      title: 'webSocketServer custom server path',
      multiCompiler: false,
      options: {
        webSocketServer: '/path/to/custom/server/',
      },
      optionsResults: null,
    },
    {
      title: 'webSocketServer custom server class',
      multiCompiler: false,
      options: {
        webSocketServer: class CustomServerImplementation {},
      },
      optionsResults: null,
    },
    {
      title: 'client custom transport path',
      multiCompiler: false,
      options: {
        client: {
          transport: '/path/to/custom/client/',
        },
      },
      optionsResults: null,
    },
    {
      title: 'client host and port',
      multiCompiler: false,
      options: {
        client: {
          host: 'my.host',
          port: 9000,
        },
      },
      optionsResults: null,
    },
    {
      title: 'client path',
      multiCompiler: false,
      options: {
        client: {
          path: '/custom/path/',
        },
      },
      optionsResults: null,
    },
    {
      title: 'client path without leading/ending slashes',
      multiCompiler: false,
      options: {
        client: {
          path: 'custom/path',
        },
      },
      optionsResults: null,
    },
    {
      title: 'liveReload is true',
      multiCompiler: false,
      options: {
        liveReload: true,
      },
      optionsResults: null,
    },
    {
      title: 'liveReload is false',
      multiCompiler: false,
      options: {
        liveReload: false,
      },
      optionsResults: null,
    },
    {
      title: 'hot is true',
      multiCompiler: false,
      options: {
        hot: true,
      },
      optionsResults: null,
    },
    {
      title: 'hot is false',
      multiCompiler: false,
      options: {
        hot: false,
      },
      optionsResults: null,
    },
    {
      title: 'hot is only',
      multiCompiler: false,
      options: {
        hot: 'only',
      },
      optionsResults: null,
    },
    {
      title: 'dev is set',
      multiCompiler: false,
      options: {
        devMiddleware: {
          serverSideRender: true,
        },
      },
      optionsResults: null,
    },
    {
      title: 'static is true',
      multiCompiler: false,
      options: {
        static: true,
      },
      optionsResults: null,
    },
    {
      title: 'static is false',
      multiCompiler: false,
      options: {
        static: false,
      },
      optionsResults: null,
    },
    {
      title: 'static is string',
      multiCompiler: false,
      options: {
        static: '/static/path',
      },
      optionsResults: null,
    },
    {
      title: 'static is an array of strings',
      multiCompiler: false,
      options: {
        static: ['/static/path1', '/static/path2'],
      },
      optionsResults: null,
    },
    {
      title: 'static is an array of static objects',
      multiCompiler: false,
      options: {
        static: [
          {
            directory: '/static/path1',
          },
          {
            publicPath: '/static/public/path',
          },
        ],
      },
      optionsResults: null,
    },
    {
      title: 'static is an array of strings and static objects',
      multiCompiler: false,
      options: {
        static: [
          '/static/path1',
          {
            publicPath: '/static/public/path/',
          },
        ],
      },
      optionsResults: null,
    },
    {
      title: 'static is an object',
      multiCompiler: false,
      options: {
        static: {
          directory: '/static/path',
        },
      },
      optionsResults: null,
    },
    {
      title: 'static directory is an absolute url and throws error',
      multiCompiler: false,
      options: {
        static: {
          directory: 'http://localhost:8080',
        },
      },
      optionsResults: null,
      throws: 'Using a URL as static.directory is not supported',
    },
    {
      title: 'static publicPath is a string',
      multiCompiler: false,
      options: {
        static: {
          publicPath: '/static/public/path/',
        },
      },
      optionsResults: null,
    },
    {
      title: 'static publicPath is an array',
      multiCompiler: false,
      options: {
        static: {
          publicPath: ['/static/public/path1/', '/static/public/path2/'],
        },
      },
      optionsResults: null,
    },
    {
      title: 'static watch is false',
      multiCompiler: false,
      options: {
        static: {
          watch: false,
        },
      },
      optionsResults: null,
    },
    {
      title: 'static watch is true',
      multiCompiler: false,
      options: {
        static: {
          watch: true,
        },
      },
      optionsResults: null,
    },
    {
      title: 'static watch is an object',
      multiCompiler: false,
      options: {
        static: {
          watch: {
            poll: 500,
          },
        },
      },
      optionsResults: null,
    },
    {
      title: 'static serveIndex is false',
      multiCompiler: false,
      options: {
        static: {
          serveIndex: false,
        },
      },
      optionsResults: null,
    },
    {
      title: 'static serveIndex is true',
      multiCompiler: false,
      options: {
        static: {
          serveIndex: true,
        },
      },
      optionsResults: null,
    },
    {
      title: 'static serveIndex is an object',
      multiCompiler: false,
      options: {
        static: {
          serveIndex: {
            icons: false,
          },
        },
      },
      optionsResults: null,
    },

    {
      title: 'single compiler watchOptions is object',
      multiCompiler: false,
      options: {},
      optionsResults: null,
      webpackConfig: {
        watch: true,
        watchOptions: {
          aggregateTimeout: 300,
        },
      },
    },
    {
      title: 'single compiler watchOptions is object with watch false',
      multiCompiler: false,
      options: {},
      optionsResults: null,
      webpackConfig: {
        watch: false,
        watchOptions: {
          aggregateTimeout: 300,
        },
      },
    },
    {
      title: 'single compiler watchOptions is object with static watch true',
      multiCompiler: false,
      options: {
        static: {
          watch: true,
        },
      },
      optionsResults: null,
      webpackConfig: {
        watch: true,
        watchOptions: {
          aggregateTimeout: 300,
        },
      },
    },
    {
      title:
        'single compiler watchOptions is object with static watch overriding it',
      multiCompiler: false,
      options: {
        static: {
          watch: {
            poll: 500,
          },
        },
      },
      optionsResults: null,
      webpackConfig: {
        watch: true,
        watchOptions: {
          aggregateTimeout: 300,
        },
      },
    },
    {
      title: 'multi compiler watchOptions is set',
      multiCompiler: true,
      options: {},
      optionsResults: null,
      webpackConfig: [
        {},
        // watchOptions are set on the second compiler
        {
          watch: true,
          watchOptions: {
            aggregateTimeout: 300,
          },
        },
      ],
    },
    {
      title: 'firewall is set',
      multiCompiler: false,
      options: {
        firewall: false,
      },
      optionsResults: null,
    },
  ];

  cases.forEach((data) => {
    describe(data.title, () => {
      let compiler;
      beforeAll(() => {
        let webpackConfig;
        if (data.multiCompiler) {
          webpackConfig = require('../../fixtures/multi-compiler-config/webpack.config');
          if (Array.isArray(data.webpackConfig)) {
            webpackConfig = data.webpackConfig.map((config, index) =>
              Object.assign({}, webpackConfig[index], config)
            );
          }
        } else {
          webpackConfig = require('../../fixtures/simple-config/webpack.config');
          if (data.webpackConfig) {
            webpackConfig = Object.assign(
              {},
              webpackConfig,
              data.webpackConfig
            );
          }
        }

        compiler = webpack(webpackConfig);
      });

      it('should set correct options', () => {
        const originalContentBase = data.options.contentBase;
        if (data.throws) {
          expect(() => {
            normalizeOptions(compiler, data.options);
          }).toThrow();
          return;
        }

        normalizeOptions(compiler, data.options);
        if (data.optionsResults) {
          expect(data.options).toEqual(data.optionsResults);
        } else {
          if (data.options.contentBase !== originalContentBase) {
            // we don't want this in the snapshot, because it is
            // the current working directory
            expect(data.options.contentBase).toEqual(process.cwd());
            delete data.options.contentBase;
          }

          if (data.options.static) {
            data.options.static.forEach((staticOpts) => {
              if (staticOpts.directory === path.join(process.cwd(), 'public')) {
                // give an indication in the snapshot that this is the
                // current working directory
                staticOpts.directory = 'CWD';
              }
            });
          }

          expect(data.options).toMatchSnapshot();
        }
      });
    });
  });
});
