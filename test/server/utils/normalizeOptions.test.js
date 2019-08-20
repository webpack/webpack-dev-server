'use strict';

const path = require('path');
const webpack = require('webpack');
const normalizeOptions = require('../../../lib/utils/normalizeOptions');
const multiWebpackConfig = require('../../fixtures/multi-compiler-config/webpack.config');
const simpleWebpackConfig = require('../../fixtures/simple-config/webpack.config');
const webpackConfigNoStats = require('../../fixtures/schema/webpack.config.no-dev-stats');

describe('normalizeOptions', () => {
  const cases = [
    {
      title: 'no options',
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },

    // compiler's options.devServer works

    {
      title: 'compiler options.devServer',
      webpackConfig: {
        devServer: {
          hot: true,
          clientLogLevel: 'silent',
        },
      },
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },

    {
      title: 'complex compiler options.devServer',
      webpackConfig: webpackConfigNoStats,
      multiCompiler: false,
      options: {},
      optionsResults: {
        contentBase: path.resolve('_contentBase'),
      },
    },

    // normal options override compiler's options.devServer

    {
      title: 'normal options override compiler options.devServer',
      webpackConfig: {
        devServer: {
          hot: true,
          clientLogLevel: 'silent',
        },
      },
      multiCompiler: false,
      options: {
        hot: false,
        clientLogLevel: 'debug',
      },
      optionsResults: null,
    },

    // contentBase
    {
      title: 'contentBase (string)',
      multiCompiler: false,
      options: {
        contentBase: 'path/to/dist',
      },
      optionsResults: {
        contentBase: path.resolve('path/to/dist'),
      },
    },
    {
      title: 'contentBase (array)',
      multiCompiler: false,
      options: {
        contentBase: ['path/to/dist1', 'path/to/dist2'],
      },
      optionsResults: {
        contentBase: [
          path.resolve('path/to/dist1'),
          path.resolve('path/to/dist2'),
        ],
      },
    },
    {
      title: 'contentBase (boolean)',
      multiCompiler: false,
      options: {
        contentBase: false,
      },
      optionsResults: null,
    },

    // watchOptions

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
      title: 'no options.filename, no compiler filename',
      webpackConfig: null,
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },
    {
      title: 'no options.filename, existing compiler filename',
      webpackConfig: {
        output: {
          filename: 'mybundle.js',
        },
      },
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },
    {
      title: 'options.watchOptions',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        watchOptions: {
          poll: true,
        },
      },
      optionsResults: null,
    },
    {
      title: 'compiler watchOptions',
      webpackConfig: {
        watchOptions: {
          poll: true,
        },
      },
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },

    // filename

    {
      title: 'no options.filename, no compiler filename',
      webpackConfig: null,
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },
    {
      title: 'no options.filename, existing compiler filename',
      webpackConfig: {
        output: {
          filename: 'mybundle.js',
        },
      },
      multiCompiler: false,
      options: {},
      optionsResults: null,
    },
    {
      title: 'existing options.filename, no compiler filename',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        filename: 'devserver-bundle.js',
      },
      optionsResults: null,
    },
    {
      title: 'existing options.filename, existing compiler filename',
      webpackConfig: {
        output: {
          filename: 'mybundle.js',
        },
      },
      multiCompiler: false,
      options: {
        filename: 'devserver-bundle.js',
      },
      optionsResults: null,
    },

    // publicPath

    {
      title: 'no options.publicPath, no compiler publicPath',
      webpackConfig: null,
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no options.publicPath, relative compiler publicPath',
      webpackConfig: {
        output: {
          publicPath: '/assets/',
        },
      },
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no options.publicPath, bad relative compiler publicPath',
      webpackConfig: {
        output: {
          publicPath: 'assets/',
        },
      },
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no options.publicPath, / compiler publicPath',
      webpackConfig: {
        output: {
          publicPath: '/',
        },
      },
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no options.publicPath, absolute url compiler publicPath',
      webpackConfig: {
        output: {
          publicPath: 'http://localhost:8080/assets/',
        },
      },
      multiCompiler: false,
      options: {},
    },
    {
      title: 'relative options.publicPath',
      webpackConfig: {
        output: {
          publicPath: '/',
        },
      },
      multiCompiler: false,
      options: {
        publicPath: '/assets/',
      },
    },
    {
      title: 'bad relative options.publicPath',
      webpackConfig: {
        output: {
          publicPath: '/',
        },
      },
      multiCompiler: false,
      options: {
        publicPath: 'assets/',
      },
    },
    {
      title: 'absolute options.publicPath',
      webpackConfig: {
        output: {
          publicPath: '/',
        },
      },
      multiCompiler: false,
      options: {
        publicPath: 'http://localhost:8080/assets/',
      },
    },

    // stats

    {
      title: 'options.stats',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        stats: 'errors-only',
      },
    },
    {
      title: 'compiler stats',
      webpackConfig: {
        stats: { errors: true },
      },
      multiCompiler: false,
      options: {},
    },

    // inline

    {
      title: 'options.inline',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        inline: false,
      },
    },

    // liveReload

    {
      title: 'options.liveReload',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        liveReload: false,
      },
    },

    // open/openPage

    {
      title: 'options.open (boolean)',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        open: true,
      },
    },
    {
      title: 'options.open (string)',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        open: 'Google Chrome',
      },
    },
    {
      title: 'options.open (empty string)',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        open: '',
      },
    },
    {
      title: 'options.openPage, no options.open',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        openPage: '/different/page',
      },
    },
    {
      title: 'options.openPage, options.open',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        open: true,
        openPage: '/different/page',
      },
    },

    // host

    // this test is here because previously devServer.host would override CLI host option
    // only if CLI's options.host was localhost. Since we want a firm stance that
    // normal/CLI options always override the compiler's devServer options, this is no
    // longer the case.
    {
      title: 'options.host localhost overrides compiler options.devServer.host',
      webpackConfig: {
        devServer: {
          host: '0.0.0.0',
        },
      },
      multiCompiler: false,
      options: {
        host: 'localhost',
      },
      optionsResults: null,
    },
    {
      title: 'options.host',
      webpackConfig: null,
      multiCompiler: false,
      options: {
        host: '0.0.0.0',
      },
      optionsResults: null,
    },

    {
      title: 'options.hot overrides compiler options.devServer.hot',
      webpackConfig: {
        devServer: {
          hot: true,
        },
      },
      multiCompiler: false,
      options: {
        hot: false,
      },
      optionsResults: null,
    },

    {
      title: 'options.hotOnly overrides compiler options.devServer.hotOnly',
      webpackConfig: {
        devServer: {
          hotOnly: true,
        },
      },
      multiCompiler: false,
      options: {
        hotOnly: false,
      },
      optionsResults: null,
    },

    {
      title:
        'options.clientLogLevel overrides compiler options.devServer.clientLogLevel',
      webpackConfig: {
        devServer: {
          clientLogLevel: 'silent',
        },
      },
      multiCompiler: false,
      options: {
        clientLogLevel: 'debug',
      },
      optionsResults: null,
    },
  ];

  cases.forEach((data) => {
    let repeatWithMultiCompiler = false;
    if (data.webpackConfig) {
      repeatWithMultiCompiler = true;
    }

    const useMultiCompiler = [false];

    if (repeatWithMultiCompiler) {
      useMultiCompiler.push(true);
    }

    useMultiCompiler.forEach((multi) => {
      data.multiCompiler = multi;
      describe(
        data.title + (data.multiCompiler ? ' (multi compiler)' : ''),
        () => {
          let compiler;
          beforeAll(() => {
            // this will merge webpack configs through a depth of one layer of objects,
            // specifically so that the webpack config output object can be merged
            const mergeConfigs = (baseConfig, config) => {
              Object.keys(config).forEach((key1) => {
                if (typeof config[key1] === 'object') {
                  Object.keys(config[key1]).forEach((key2) => {
                    if (!baseConfig[key1]) {
                      baseConfig[key1] = {};
                    }
                    baseConfig[key1][key2] = config[key1][key2];
                  });
                } else {
                  baseConfig[key1] = config[key1];
                }
              });
            };

            let webpackConfig;
            if (data.multiCompiler) {
              webpackConfig = [Object.assign({}, multiWebpackConfig[0])];
            } else {
              webpackConfig = Object.assign({}, simpleWebpackConfig);
            }

            if (data.webpackConfig) {
              mergeConfigs(
                data.multiCompiler ? webpackConfig[0] : webpackConfig,
                data.webpackConfig
              );
            }

            compiler = webpack(webpackConfig);
          });

          it('should set correct options', () => {
            const optionsClone = Object.assign({}, data.options);
            const originalContentBase = optionsClone.contentBase;
            normalizeOptions(compiler, optionsClone);
            if (data.optionsResults) {
              Object.keys(data.optionsResults).forEach((key) => {
                expect(optionsClone[key]).toEqual(data.optionsResults[key]);
                delete optionsClone[key];
              });
            }

            if (
              optionsClone.contentBase &&
              optionsClone.contentBase !== originalContentBase
            ) {
              // we don't want this in the snapshot, because it is
              // the current working directory
              expect(optionsClone.contentBase).toEqual(process.cwd());
              delete optionsClone.contentBase;
            }
            expect(optionsClone).toMatchSnapshot();
          });
        }
      );
    });
  });
});
