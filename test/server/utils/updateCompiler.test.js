'use strict';

const webpack = require('webpack');
const updateCompiler = require('../../../lib/utils/updateCompiler');
const DevServerEntryPlugin = require('../../../lib/utils/DevServerEntryPlugin');
const isWebpack5 = require('../../helpers/isWebpack5');

describe('updateCompiler', () => {
  describe('simple config, no hot', () => {
    let compiler;

    beforeAll(() => {
      const webpackConfig = require('../../fixtures/simple-config/webpack.config');

      compiler = webpack(webpackConfig);
    });

    it('should apply plugins without HMR', () => {
      updateCompiler(compiler, {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
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

      expect(compiler.hooks.entryOption.taps.length).toBe(1);
      expect(tapsByHMR).toEqual(0);
      expect(tapsByProvidePlugin).toEqual(1);

      if (isWebpack5) {
        expect(compiler.options.plugins).toHaveLength(1);
        expect(compiler.options.plugins[0]).toBeInstanceOf(
          DevServerEntryPlugin
        );
      } else {
        expect(compiler.options.plugins).toBeUndefined();
      }
    });
  });

  describe('simple config, hot', () => {
    let compiler;

    beforeAll(() => {
      const webpackConfig = require('../../fixtures/simple-config/webpack.config');

      compiler = webpack(webpackConfig);
    });

    it('should apply plugins', () => {
      updateCompiler(compiler, {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
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

      expect(compiler.hooks.entryOption.taps.length).toBe(1);
      expect(tapsByHMR).toEqual(1);
      expect(tapsByProvidePlugin).toEqual(1);
      expect(compiler.options.plugins).toContainEqual(
        new webpack.HotModuleReplacementPlugin()
      );
      if (isWebpack5) {
        expect(compiler.options.plugins[0]).toBeInstanceOf(
          DevServerEntryPlugin
        );
      }
    });
  });

  describe('simple config with HMR already, hot', () => {
    let compiler;

    beforeAll(() => {
      const webpackConfig = require('../../fixtures/simple-config/webpack.config');

      webpackConfig.plugins = [new webpack.HotModuleReplacementPlugin()];

      compiler = webpack(webpackConfig);
    });

    it('should apply plugins', () => {
      updateCompiler(compiler, {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
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

      expect(compiler.hooks.entryOption.taps.length).toBe(1);
      expect(tapsByHMR).toEqual(1);
      expect(tapsByProvidePlugin).toEqual(1);
      expect(compiler.options.plugins).toContainEqual(
        new webpack.HotModuleReplacementPlugin()
      );
      if (isWebpack5) {
        expect(compiler.options.plugins[1]).toBeInstanceOf(
          DevServerEntryPlugin
        );
      }
    });
  });

  describe('multi compiler config, hot', () => {
    let multiCompiler;

    beforeAll(() => {
      const webpackConfig = require('../../fixtures/multi-compiler-2-config/webpack.config');

      webpackConfig[1].plugins = [new webpack.HotModuleReplacementPlugin()];

      multiCompiler = webpack(webpackConfig);
    });

    it('should apply plugins', () => {
      updateCompiler(multiCompiler, {
        transportMode: {
          server: 'sockjs',
          client: 'sockjs',
        },
        hot: true,
      });

      multiCompiler.compilers.forEach((compiler, index) => {
        let tapsByHMR = 0;
        let tapsByProvidePlugin = 0;

        compiler.hooks.compilation.taps.forEach((tap) => {
          if (tap.name === 'HotModuleReplacementPlugin') {
            tapsByHMR += 1;
          } else if (tap.name === 'ProvidePlugin') {
            tapsByProvidePlugin += 1;
          }
        });

        expect(compiler.hooks.entryOption.taps.length).toBe(1);
        expect(tapsByHMR).toEqual(1);
        expect(tapsByProvidePlugin).toEqual(1);
        expect(compiler.options.plugins).toContainEqual(
          new webpack.HotModuleReplacementPlugin()
        );
        if (isWebpack5) {
          expect(compiler.options.plugins[index]).toBeInstanceOf(
            DevServerEntryPlugin
          );
        }
      });
    });
  });
});
