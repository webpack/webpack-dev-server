'use strict';

/* eslint import/no-extraneous-dependencies: off */

require('should');

const webpack = require('webpack');
const OptionsValidationError = require('../../lib/OptionsValidationError');
const DevServer = require('../../lib/DevServer');
const { validateHost } = require('../../lib/util');
const optionsSchema = require('../../lib/schemas/options.json');
const config = require('../fixtures/simple-config/webpack.config'); // eslint-disable-line

const publicPath = '/';
const testCases = require('../fixtures/validation-options')(publicPath, optionsSchema);

describe('Validation', () => {
  let compiler;

  before(() => {
    compiler = webpack(config);
  });

  after(() => {
    compiler = null;
  });

  testCases.forEach((testCase) => {
    it(`should fail validation for ${testCase.name}`, () => {
      try {
        // eslint-disable-next-line no-new
        new DevServer(compiler, testCase.config);
      } catch (e) {
        if (!(e instanceof OptionsValidationError)) {
          throw e;
        }
        e.message.should.startWith('Invalid configuration object.');
        e.message.split('\n').slice(1).should.be.eql(testCase.message);
        return;
      }
      throw new Error("Validation didn't fail");
    });
  });

  describe('validateHost', () => {
    let server;

    afterEach(() => {
      server.close();
    });
    //
    it('should always allow any host if options.disableHostCheck is set', () => {
      const options = {
        public: 'test.host:80',
        disableHostCheck: true,
        publicPath,
        quiet: true
      };
      const headers = {
        host: 'bad.host'
      };
      server = new DevServer(compiler, options);
      if (!validateHost(headers, options)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.public when host is localhost', () => {
      const options = {
        public: 'test.host:80',
        publicPath,
        quiet: true
      };
      const headers = {
        host: 'localhost'
      };
      server = new DevServer(compiler, options);
      if (!validateHost(headers, options)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow any valid options.public when host is 127.0.0.1', () => {
      const options = {
        public: 'test.host:80',
        publicPath,
        quiet: true
      };
      const headers = {
        host: '127.0.0.1'
      };
      server = new DevServer(compiler, options);
      if (!validateHost(headers, options)) {
        throw new Error("Validation didn't fail");
      }
    });

    it('should allow access for every requests using an IP', () => {
      const options = { publicPath, quiet: true };
      const testHosts = [
        '192.168.1.123',
        '192.168.1.2:8080',
        '[::1]',
        '[::1]:8080',
        '[ad42::1de2:54c2:c2fa:1234]',
        '[ad42::1de2:54c2:c2fa:1234]:8080'
      ];

      server = new DevServer(compiler, options);
      testHosts.forEach((testHost) => {
        const headers = { host: testHost };
        if (!validateHost(headers, options)) {
          throw new Error("Validation didn't pass");
        }
      });
    });

    it("should not allow hostnames that don't match options.public", () => {
      const options = {
        public: 'test.host:80',
        publicPath,
        quiet: true
      };
      const headers = {
        host: 'test.hostname:80'
      };
      server = new DevServer(compiler, options);
      if (validateHost(headers, options)) {
        throw new Error("Validation didn't fail");
      }
    });
  });

  describe('allowedHosts', () => {
    let server;

    afterEach(() => {
      server.close();
    });

    it('should allow hosts in allowedHosts', () => {
      const testHosts = [
        'test.host',
        'test2.host',
        'test3.host'
      ];
      const options = {
        allowedHosts: testHosts,
        publicPath,
        info: false
      };
      server = new DevServer(compiler, options);

      testHosts.forEach((testHost) => {
        const headers = { host: testHost };
        if (!validateHost(headers, options)) {
          throw new Error("Validation didn't fail");
        }
      });
    });

    it('should allow hosts that pass a wildcard in allowedHosts', () => {
      const options = {
        allowedHosts: ['.example.com'],
        publicPath,
        quiet: true
      };
      server = new DevServer(compiler, options);
      const testHosts = [
        'www.example.com',
        'subdomain.example.com',
        'example.com',
        'subsubcomain.subdomain.example.com',
        'example.com:80',
        'subdomain.example.com:80'
      ];

      testHosts.forEach((testHost) => {
        const headers = { host: testHost };
        const res = validateHost(headers, options);
        if (!res) {
          throw new Error("Validation didn't fail");
        }
      });
    });
  });
});
