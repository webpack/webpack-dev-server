'use strict';

const webpack = require('webpack');
const setPublicPath = require('../../../lib/utils/setPublicPath');

describe('setPublicPath', () => {
  const cases = [
    {
      title: 'no devServer.publicPath, no compiler publicPath',
      webpackPublicPath: null,
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no devServer.publicPath, relative compiler publicPath',
      webpackPublicPath: '/assets/',
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no devServer.publicPath, bad relative compiler publicPath',
      webpackPublicPath: 'assets/',
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no devServer.publicPath, / compiler publicPath',
      webpackPublicPath: '/',
      multiCompiler: false,
      options: {},
    },
    {
      title: 'no devServer.publicPath, absolute url compiler publicPath',
      webpackPublicPath: 'http://localhost:8080/assets/',
      multiCompiler: false,
      options: {},
    },
    {
      title: 'multi compiler, no devServer.publicPath, no compiler publicPath',
      webpackPublicPath: null,
      multiCompiler: false,
      options: {},
    },
    {
      title:
        'multi compiler, no devServer.publicPath, relative compiler publicPath',
      webpackPublicPath: '/assets/',
      multiCompiler: false,
      options: {},
    },
    {
      title:
        'multi compiler, no devServer.publicPath, bad relative compiler publicPath',
      webpackPublicPath: 'assets/',
      multiCompiler: false,
      options: {},
    },
    {
      title: 'multi compiler, no devServer.publicPath, / compiler publicPath',
      webpackPublicPath: '/',
      multiCompiler: false,
      options: {},
    },
    {
      title:
        'multi compiler, no devServer.publicPath, absolute url compiler publicPath',
      webpackPublicPath: 'http://localhost:8080/assets/',
      multiCompiler: false,
      options: {},
    },
    {
      title: 'relative devServer.publicPath',
      webpackPublicPath: '/',
      multiCompiler: false,
      options: {
        publicPath: '/assets/',
      },
    },
    {
      title: 'bad relative devServer.publicPath',
      webpackPublicPath: '/',
      multiCompiler: false,
      options: {
        // this should not be corrected to /assets/, because it should only be fixed
        // if inferred using the compiler options for backwards compatability
        publicPath: 'assets/',
      },
    },
    {
      title: 'absolute devServer.publicPath',
      webpackPublicPath: '/',
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
        let webpackConfig;
        if (data.multiCompiler) {
          // eslint-disable-next-line global-require
          webpackConfig = require('../../fixtures/multi-compiler-config/webpack.config');
          if (data.webpackPublicPath) {
            webpackConfig[0].output.publicPath = data.webpackPublicPath;
          }
        } else {
          // eslint-disable-next-line global-require
          webpackConfig = require('../../fixtures/simple-config/webpack.config');
          if (data.webpackPublicPath) {
            webpackConfig.output.publicPath = data.webpackPublicPath;
          }
        }

        compiler = webpack(webpackConfig);
      });

      it('should set correct options.publicPath', () => {
        setPublicPath(compiler, data.options);
        expect(data.options).toMatchSnapshot();
      });
    });
  });
});
