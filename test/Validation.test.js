'use strict';

const webpack = require('webpack');
const Server = require('../lib/Server');
const config = require('./fixtures/simple-config/webpack.config');

describe('Validation', () => {
  let compiler;
  let server;

  beforeAll(() => {
    compiler = webpack(config);
  });

  describe('validation', () => {
    afterEach((done) => {
      // `server` is undefined if a test is good
      if (server) {
        server.close(() => {
          done();
        });
      } else {
        done();
      }
    });

    const tests = [
      {
        name: 'invalid `hot` configuration',
        config: { hot: 'false' },
      },
      {
        name: 'invalid `injectHot` configuration',
        config: { injectHot: 1 },
      },
      {
        name: 'invalid `static` configuration',
        config: { static: [0] },
      },
      {
        name: 'no additional properties',
        config: { additional: true },
      },
    ];

    tests.forEach((test) => {
      it(`should fail validation for ${test.name}`, () => {
        try {
          if (!test.config.static) {
            test.config.static = false;
          }
          server = new Server(compiler, test.config);
        } catch (err) {
          if (err.name !== 'ValidationError') {
            throw err;
          }

          const [title] = err.message.split('\n\n');

          expect(title).toMatchSnapshot();
          return;
        }

        throw new Error("Validation didn't fail");
      });
    });
  });

  describe('checkHost', () => {
    afterEach((done) => {
      server.close(() => {
        done();
      });
    });

    it('should always allow any host if options.firewall is disabled', () => {
      const options = {
        public: 'test.host:80',
        firewall: false,
      };

      const headers = {
        host: 'bad.host',
      };

      server = new Server(compiler, options);

      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.public when host is localhost', () => {
      const options = {
        public: 'test.host:80',
      };
      const headers = {
        host: 'localhost',
      };
      server = new Server(compiler, options);
      if (!server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.public when host is 127.0.0.1', () => {
      const options = {
        public: 'test.host:80',
      };

      const headers = {
        host: '127.0.0.1',
      };

      server = new Server(compiler, options);

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
        '[ad42::1de2:54c2:c2fa:1234]:8080',
      ];

      server = new Server(compiler, options);

      tests.forEach((test) => {
        const headers = { host: test };

        if (!server.checkHost(headers)) {
          throw new Error("Validation didn't pass");
        }
      });
    });

    it("should not allow hostnames that don't match options.public", () => {
      const options = {
        public: 'test.host:80',
      };

      const headers = {
        host: 'test.hostname:80',
      };

      server = new Server(compiler, options);

      if (server.checkHost(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow urls with scheme for checking origin', () => {
      const options = {
        public: 'test.host:80',
      };
      const headers = {
        origin: 'https://test.host',
      };
      server = new Server(compiler, options);
      if (!server.checkOrigin(headers)) {
        throw new Error("Validation didn't fail");
      }
    });

    describe('firewall', () => {
      it('should allow hosts in firewall', () => {
        const tests = ['test.host', 'test2.host', 'test3.host'];
        const options = { firewall: tests };
        server = new Server(compiler, options);
        tests.forEach((test) => {
          const headers = { host: test };
          if (!server.checkHost(headers)) {
            throw new Error("Validation didn't fail");
          }
        });
      });

      it('should allow hosts that pass a wildcard in firewall', () => {
        const options = { firewall: ['.example.com'] };
        server = new Server(compiler, options);
        const tests = [
          'www.example.com',
          'subdomain.example.com',
          'example.com',
          'subsubcomain.subdomain.example.com',
          'example.com:80',
          'subdomain.example.com:80',
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
