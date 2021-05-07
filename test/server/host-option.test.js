'use strict';

const path = require('path');
const request = require('supertest');
const internalIp = require('internal-ip');
const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map')['host-option'];

const staticDirectory = path.resolve(
  __dirname,
  '../fixtures/contentbase-config'
);

describe('host option', () => {
  let server = null;
  let req = null;

  describe('is not be specified', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('::');
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is undefined', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          // eslint-disable-next-line no-undefined
          host: undefined,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('::');
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is null', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: null,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('::');
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is 127.0.0.1 (IPv4)', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: '127.0.0.1',
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is localhost', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: 'localhost',
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is 0.0.0.0', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: '0.0.0.0',
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('0.0.0.0');
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is local-ip', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: 'local-ip',
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();
      const networkIP = internalIp.v4.sync();

      expect(address.address).toBe(networkIP);
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is local-ipv4', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          host: 'local-ipv4',
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();
      const networkIP = internalIp.v4.sync();

      expect(address.address).toBe(networkIP);
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });
});
