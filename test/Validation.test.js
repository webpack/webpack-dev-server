'use strict';

/* eslint-disable
  no-shadow,
  array-bracket-spacing
*/
const webpack = require('webpack');
const Server = require('../lib/Server');
const config = require('./fixtures/simple-config/webpack.config');

describe('Validation', () => {
  let compiler;

  before(() => {
    compiler = webpack(config);
  });

  const tests = [
    {
      name: 'invalid `hot` configuration',
      config: { hot: 'false' },
      message: 'options.hot should be {Boolean} (https://webpack.js.org/configuration/dev-server/#devserver-hot)\n'
    },
    {
      name: 'invalid `logLevel` configuration',
      config: { logLevel: 1 },
      message: 'options.logLevel should be {String} and equal to one of the allowed values'
    },
    {
      name: 'invalid `writeToDisk` configuration',
      config: { writeToDisk: 1 },
      message: 'options.writeToDisk should be {Boolean|Function} (https://github.com/webpack/webpack-dev-middleware#writetodisk)\n'
    },
    {
      name: 'invalid `overlay` configuration',
      config: { overlay: { errors: 1 } },
      message: 'options.overlay should be {Object|Boolean} (https://webpack.js.org/configuration/dev-server/#devserver-overlay)\n'
    },
    {
      name: 'invalid `contentBase` configuration',
      config: { contentBase: [0] },
      message: 'options.contentBase should be {Array} (https://webpack.js.org/configuration/dev-server/#devserver-contentbase)\n'
    },
    {
      name: 'no additional properties',
      config: { additional: true },
      message: 'options should NOT have additional properties\n'
    }
  ];

  tests.forEach((test) => {
    it(`should fail validation for ${test.name}`, () => {
      try {
        // eslint-disable-next-line no-new
        new Server(compiler, test.config);
      } catch (err) {
        if (err.name !== 'ValidationError') {
          throw err;
        }

        const [ title, message ] = err.message.split('\n\n');

        title.should.be.eql('webpack Dev Server Invalid Options');
        message.should.be.eql(test.message);

        return;
      }

      throw new Error("Validation didn't fail");
    });
  });

  describe('filename', () => {
    it('should allow filename to be a function', () => {
      try {
        // eslint-disable-next-line no-new
        new Server(compiler, { filename: () => {} });
      } catch (err) {
        if (err === 'ValidationError') {
          throw err;
        }

        throw new Error("Validation failed and it shouldn't");
      }
    });
  });

  describe('checkHost', () => {
    it('should always allow any host if options.disableHostCheck is set', () => {
      const options = {
        public: 'test.host:80',
        disableHostCheck: true
      };

      const headers = {
        host: 'bad.host'
      };

      const server = new Server(compiler, options);

      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.public when host is localhost', () => {
      const options = {
        public: 'test.host:80'
      };
      const headers = {
        host: 'localhost'
      };
      const server = new Server(compiler, options);
      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.public when host is 127.0.0.1', () => {
      const options = {
        public: 'test.host:80'
      };

      const headers = {
        host: '127.0.0.1'
      };

      const server = new Server(compiler, options);

      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow access for every requests using an IP', () => {
      const options = {};

      const tests = [
        '192.168.1.123',
        '192.168.1.2:8080',
        '[::1]',
        '[::1]:8080',
        '[ad42::1de2:54c2:c2fa:1234]',
        '[ad42::1de2:54c2:c2fa:1234]:8080'
      ];

      const server = new Server(compiler, options);

      tests.forEach((test) => {
        const headers = { host: test };

        if (!server.checkHost(headers)) {
          throw new Error("Validation didn't pass");
        }
      });
    });

    it("should not allow hostnames that don't match options.public", () => {
      const options = {
        public: 'test.host:80'
      };

      const headers = {
        host: 'test.hostname:80'
      };

      const server = new Server(compiler, options);

      if (server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow urls with scheme for checking origin', () => {
      const options = {
        public: 'test.host:80'
      };
      const headers = {
        origin: 'https://test.host'
      };
      const server = new Server(compiler, options);
      if (!server.checkOrigin(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    describe('allowedHosts', () => {
      it('should allow hosts in allowedHosts', () => {
        const tests = [
          'test.host',
          'test2.host',
          'test3.host'
        ];

        const options = { allowedHosts: tests };
        const server = new Server(compiler, options);

        tests.forEach((test) => {
          const headers = { host: test };

          if (!server.checkHost(headers)) {
            throw new Error("Validation didn't fail");
          }
        });
      });

      it('should allow hosts that pass a wildcard in allowedHosts', () => {
        const options = { allowedHosts: ['.example.com'] };
        const server = new Server(compiler, options);

        const tests = [
          'www.example.com',
          'subdomain.example.com',
          'example.com',
          'subsubcomain.subdomain.example.com',
          'example.com:80',
          'subdomain.example.com:80'
        ];

        tests.forEach((test) => {
          const headers = { host: test };

          if (!server.checkHost(headers)) {
            throw new Error("Validation didn't fail");
          }
        });
      });
    });
  });
});
