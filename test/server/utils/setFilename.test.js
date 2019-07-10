'use strict';

const webpack = require('webpack');
const setFilename = require('../../../lib/utils/setFilename');

describe('setFilename', () => {
  const cases = [
    {
      title: 'no devServer.filename, no compiler filename',
      webpackFilename: null,
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no devServer.filename, existing compiler filename',
      webpackFilename: 'mybundle.js',
      multiCompiler: false,
      options: {},
    },
    {
      title: 'existing devServer.filename, no compiler filename',
      webpackFilename: null,
      multiCompiler: false,
      options: {
        filename: 'devserver-bundle.js',
      },
    },
    {
      title: 'existing devServer.filename, existing compiler filename',
      webpackFilename: 'mybundle.js',
      multiCompiler: false,
      options: {
        filename: 'devserver-bundle.js',
      },
    },
    {
      title: 'multi compiler, no devServer.filename, no compiler filename',
      webpackFilename: null,
      multiCompiler: true,
      options: {},
    },
    {
      title:
        'multi compiler, no devServer.filename, existing compiler filename',
      webpackFilename: 'mybundle.js',
      multiCompiler: true,
      options: {},
    },
    {
      title:
        'multi compiler, existing devServer.filename, no compiler filename',
      webpackFilename: null,
      multiCompiler: true,
      options: {
        filename: 'devserver-bundle.js',
      },
    },
    {
      title:
        'multi compiler, existing devServer.filename, existing compiler filename',
      webpackFilename: 'mybundle.js',
      multiCompiler: true,
      options: {
        filename: 'devserver-bundle.js',
      },
    },
  ];

  cases.forEach((data) => {
    describe(data.title, () => {
      let compiler;
      beforeAll(() => {
        let webpackConfig;
        if (data.multiCompiler) {
          // eslint-disable-next-line global-require
          webpackConfig = require('../../fixtures/multi-compiler-config/webpack.config');
          if (data.webpackFilename) {
            webpackConfig[0].output.filename = data.webpackFilename;
          }
        } else {
          // eslint-disable-next-line global-require
          webpackConfig = require('../../fixtures/simple-config/webpack.config');
          if (data.webpackFilename) {
            webpackConfig.output.filename = data.webpackFilename;
          }
        }

        compiler = webpack(webpackConfig);
      });

      it('should set correct options.filename', () => {
        setFilename(compiler, data.options);
        expect(data.options).toMatchSnapshot();
      });
    });
  });
});
