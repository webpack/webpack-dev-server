'use strict';

const webpack = require('webpack');
const updateCompiler = require('../../../lib/utils/updateCompiler');

describe('updateCompiler', () => {
  describe('simple config, inline', () => {
    let compiler;
    beforeAll(() => {
      const webpackConfig = require('../../fixtures/simple-config/webpack.config');
      compiler = webpack(webpackConfig);
    });

    it('should apply plugins without HMR', () => {
      const spy = jest.spyOn(compiler.hooks.entryOption, 'call');

      updateCompiler(compiler, {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
        inline: true,
      });

      let tapsByHMR = 0;
      let tapsByProvidePlugin = 0;
      compiler.hooks.compilation.taps.forEach((tap) => {
        if (tap.name === 'HotModuleReplacementPlugin') {
          tapsByHMR += 1;
        } else if (tap.name === 'ProvidePlugin') {
          tapsByProvidePlugin += 1;
        }
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(tapsByHMR).toEqual(0);
      expect(tapsByProvidePlugin).toEqual(1);
      // should be empty
      expect(compiler.options.plugins).toMatchSnapshot();

      spy.mockRestore();
    });
  });

  describe('simple config, hot and inline', () => {
    let compiler;
    beforeAll(() => {
      const webpackConfig = require('../../fixtures/simple-config/webpack.config');
      compiler = webpack(webpackConfig);
    });

    it('should apply plugins', () => {
      const spy = jest.spyOn(compiler.hooks.entryOption, 'call');

      updateCompiler(compiler, {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
        inline: true,
        hot: true,
      });

      let tapsByHMR = 0;
      let tapsByProvidePlugin = 0;
      compiler.hooks.compilation.taps.forEach((tap) => {
        if (tap.name === 'HotModuleReplacementPlugin') {
          tapsByHMR += 1;
        } else if (tap.name === 'ProvidePlugin') {
          tapsByProvidePlugin += 1;
        }
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(tapsByHMR).toEqual(1);
      expect(tapsByProvidePlugin).toEqual(1);
      expect(compiler.options.plugins).toMatchSnapshot();

      spy.mockRestore();
    });
  });

  describe('simple config with HMR already, hot and inline', () => {
    let compiler;
    beforeAll(() => {
      const webpackConfig = require('../../fixtures/simple-config/webpack.config');
      webpackConfig.plugins = [new webpack.HotModuleReplacementPlugin()];
      compiler = webpack(webpackConfig);
    });

    it('should apply plugins', () => {
      const spy = jest.spyOn(compiler.hooks.entryOption, 'call');

      updateCompiler(compiler, {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
        inline: true,
        hot: true,
      });

      let tapsByHMR = 0;
      let tapsByProvidePlugin = 0;
      compiler.hooks.compilation.taps.forEach((tap) => {
        if (tap.name === 'HotModuleReplacementPlugin') {
          tapsByHMR += 1;
        } else if (tap.name === 'ProvidePlugin') {
          tapsByProvidePlugin += 1;
        }
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(tapsByHMR).toEqual(1);
      expect(tapsByProvidePlugin).toEqual(1);
      expect(compiler.options.plugins).toMatchSnapshot();

      spy.mockRestore();
    });
  });

  describe('multi compiler config, hot and inline', () => {
    let multiCompiler;
    beforeAll(() => {
      const webpackConfig = require('../../fixtures/multi-compiler-2-config/webpack.config');
      webpackConfig[1].plugins = [new webpack.HotModuleReplacementPlugin()];
      multiCompiler = webpack(webpackConfig);
    });

    it('should apply plugins', () => {
      const spies = [];
      multiCompiler.compilers.forEach((compiler) => {
        spies.push(jest.spyOn(compiler.hooks.entryOption, 'call'));
      });

      updateCompiler(multiCompiler, {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
        inline: true,
        hot: true,
      });

      spies.forEach((spy) => {
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
      });

      multiCompiler.compilers.forEach((compiler) => {
        let tapsByHMR = 0;
        let tapsByProvidePlugin = 0;
        compiler.hooks.compilation.taps.forEach((tap) => {
          if (tap.name === 'HotModuleReplacementPlugin') {
            tapsByHMR += 1;
          } else if (tap.name === 'ProvidePlugin') {
            tapsByProvidePlugin += 1;
          }
        });
        expect(tapsByHMR).toEqual(1);
        expect(tapsByProvidePlugin).toEqual(1);
        expect(compiler.options.plugins).toMatchSnapshot();
      });
    });
  });
});
