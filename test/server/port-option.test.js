'use strict';

const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['port-option'];

describe('port', () => {
  let server = null;
  let req = null;

  describe('is a string', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          port: `${port}`,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.listeningApp.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is a number', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.listeningApp.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(port);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is not specified', () => {
    beforeAll((done) => {
      // the options object here should be empty, because port is not specified in this test
      server = testServer.start(config, {}, done);
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.listeningApp.address();

      expect(address.address).toBe('127.0.0.1');
      // Likely port 8080, but not guaranteed if port is taken
      expect(address.port).toBeDefined();
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
          // eslint-disable-next-line no-undefined
          port: undefined,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.listeningApp.address();

      expect(address.address).toBe('127.0.0.1');
      // Likely port 8080, but not guaranteed if port is taken
      expect(address.port).toBeDefined();
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
          port: null,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.listeningApp.address();

      expect(address.address).toBe('127.0.0.1');
      // Likely port 8080, but not guaranteed if port is taken
      expect(address.port).toBeDefined();
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });
});
