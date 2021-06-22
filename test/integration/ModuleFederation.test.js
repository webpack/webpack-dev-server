'use strict';

const webpack = require('webpack');
const request = require('supertest');
const requireFromString = require('require-from-string');
const Server = require('../../lib/Server');
const simpleConfig = require('../fixtures/module-federation-config/webpack.config');
const objectEntryConfig = require('../fixtures/module-federation-config/webpack.object-entry.config');
const multiConfig = require('../fixtures/module-federation-config/webpack.multi.config');
const port = require('../ports-map')['module-federation'];
const isWebpack5 = require('../helpers/isWebpack5');

let pluginConfig;

if (isWebpack5) {
  pluginConfig = require('../fixtures/module-federation-config/webpack.plugin');
}

describe('module federation', () => {
  describe.each([
    ['simple multi-entry config', simpleConfig],
    ['object multi-entry config', objectEntryConfig],
    ['multi compiler config', multiConfig],
  ])('%s', (title, config) => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server({ port }, compiler);

      await new Promise((resolve, reject) => {
        server.listen(port, '127.0.0.1', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it('should use the last entry export', async () => {
      const { text, statusCode } = await req.get('/main.js');

      expect(statusCode).toEqual(200);
      expect(text).toContain('entry1');

      let exports;

      expect(() => {
        exports = requireFromString(text);
      }).not.toThrow();
      expect(exports).toEqual('entry2');
    });

    if (title === 'object multi-entry config') {
      it('should support the named entry export', async () => {
        const { text, statusCode } = await req.get('/foo.js');

        expect(statusCode).toEqual(200);
        expect(text).not.toContain('entry2');

        let exports;

        expect(() => {
          exports = requireFromString(text);
        }).not.toThrow();

        expect(exports).toEqual('entry1');
      });
    }
  });

  (isWebpack5 ? describe : describe.skip)('use plugin', () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(pluginConfig);

      server = new Server({ port }, compiler);

      await new Promise((resolve, reject) => {
        server.listen(port, '127.0.0.1', (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it('should contain hot script', async () => {
      const responseRemoteEntry = await req.get('/remoteEntry.js');

      expect(responseRemoteEntry.statusCode).toEqual(200);
      expect(responseRemoteEntry.text).toMatch(/webpack\/hot\/dev-server\.js/);

      const responseMain = await req.get('/main.js');

      expect(responseMain.statusCode).toEqual(200);
      expect(responseMain.text).toMatch(/webpack\/hot\/dev-server\.js/);
    });
  });
});
