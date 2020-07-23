'use strict';

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
      title: 'contentBase string',
      multiCompiler: false,
      options: {
        contentBase: '/path/to/dist',
      },
      optionsResults: null,
    },
    {
      title: 'contentBase array',
      multiCompiler: false,
      options: {
        contentBase: ['/path/to/dist1', '/path/to/dist2'],
      },
      optionsResults: null,
    },
    {
      title: 'watchOptions',
      multiCompiler: false,
      options: {
        watchOptions: {
          poll: true,
        },
      },
      optionsResults: null,
    },
    {
      title: 'transportMode sockjs string',
      multiCompiler: false,
      options: {
        transportMode: 'sockjs',
      },
      optionsResults: null,
    },
    {
      title: 'transportMode ws string',
      multiCompiler: false,
      options: {
        transportMode: 'ws',
      },
      optionsResults: null,
    },
    {
      title: 'transportMode ws object',
      multiCompiler: false,
      options: {
        transportMode: {
          server: 'ws',
          client: 'ws',
        },
      },
      optionsResults: null,
    },
    {
      title: 'transportMode custom server path',
      multiCompiler: false,
      options: {
        transportMode: {
          server: '/path/to/custom/server/',
        },
      },
      optionsResults: null,
    },
    {
      title: 'transportMode custom server class',
      multiCompiler: false,
      options: {
        transportMode: {
          server: class CustomServerImplementation {},
        },
      },
      optionsResults: null,
    },
    {
      title: 'transportMode custom client path',
      multiCompiler: false,
      options: {
        transportMode: {
          client: '/path/to/custom/client/',
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
        dev: {
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
            publicPath: '/static/public/path',
          },
        ],
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
        } else {
          webpackConfig = require('../../fixtures/simple-config/webpack.config');
        }

        compiler = webpack(webpackConfig);
      });

      it('should set correct options', () => {
        const originalContentBase = data.options.contentBase;
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
              if (staticOpts.directory === process.cwd()) {
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
