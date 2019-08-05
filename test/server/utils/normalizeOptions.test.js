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
      title: 'contentBase string',
      multiCompiler: false,
      options: {
        contentBase: 'path/to/dist',
      },
      optionsResults: {
        contentBase: path.resolve('path/to/dist'),
      },
    },
    {
      title: 'contentBase array',
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
    {
      title: 'multi compiler, no options.filename, no compiler filename',
      webpackConfig: null,
      multiCompiler: true,
      options: {},
      optionsResults: null,
    },
    {
      title: 'multi compiler, no options.filename, existing compiler filename',
      webpackConfig: {
        output: {
          filename: 'mybundle.js',
        },
      },
      multiCompiler: true,
      options: {},
      optionsResults: null,
    },
    {
      title: 'multi compiler, existing options.filename, no compiler filename',
      webpackConfig: null,
      multiCompiler: true,
      options: {
        filename: 'devserver-bundle.js',
      },
      optionsResults: null,
    },
    {
      title:
        'multi compiler, existing options.filename, existing compiler filename',
      webpackConfig: {
        output: {
          filename: 'mybundle.js',
        },
      },
      multiCompiler: true,
      options: {
        filename: 'devserver-bundle.js',
      },
      optionsResults: null,
    },

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
      title: 'multi compiler, no options.publicPath, no compiler publicPath',
      webpackConfig: null,
      multiCompiler: true,
      options: {},
    },
    {
      title:
        'multi compiler, no options.publicPath, relative compiler publicPath',
      webpackConfig: {
        output: {
          publicPath: '/assets/',
        },
      },
      multiCompiler: true,
      options: {},
    },
    {
      title:
        'multi compiler, no options.publicPath, bad relative compiler publicPath',
      webpackConfig: {
        output: {
          publicPath: 'assets/',
        },
      },
      multiCompiler: true,
      options: {},
    },
    {
      title: 'multi compiler, no options.publicPath, / compiler publicPath',
      webpackConfig: {
        output: {
          publicPath: '/',
        },
      },
      multiCompiler: true,
      options: {},
    },
    {
      title:
        'multi compiler, no options.publicPath, absolute url compiler publicPath',
      webpackConfig: {
        output: {
          publicPath: 'http://localhost:8080/assets/',
        },
      },
      multiCompiler: true,
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
  ];

  cases.forEach((data) => {
    describe(data.title, () => {
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
          webpackConfig = require('../../fixtures/multi-compiler-config/webpack.config');
        } else {
          webpackConfig = require('../../fixtures/simple-config/webpack.config');
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
        const originalContentBase = data.options.contentBase;
        normalizeOptions(compiler, data.options);
        if (data.optionsResults) {
          Object.keys(data.optionsResults).forEach((key) => {
            expect(data.options[key]).toEqual(data.optionsResults[key]);
            delete data.options[key];
          });
        }

        if (
          data.options.contentBase &&
          data.options.contentBase !== originalContentBase
        ) {
          // we don't want this in the snapshot, because it is
          // the current working directory
          expect(data.options.contentBase).toEqual(process.cwd());
          delete data.options.contentBase;
        }
        expect(data.options).toMatchSnapshot();
      });
    });
  });
});
