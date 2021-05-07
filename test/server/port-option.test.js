'use strict';

const path = require('path');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['port-option'];

const staticDirectory = path.resolve(
  __dirname,
  '../fixtures/contentbase-config'
);

describe('port', () => {
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
          host: 'localhost',
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      // Random port
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
          static: {
            directory: staticDirectory,
            watch: false,
          },
          // eslint-disable-next-line no-undefined
          port: undefined,
          host: 'localhost',
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      // Random port
      expect(address.port).toBeDefined();
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is auto', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          port: 'auto',
          host: 'localhost',
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      // Random port
      expect(address.port).toBeDefined();
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is "33333"', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          port: '33333',
          host: 'localhost',
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(33333);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });

  describe('is 33333', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          static: {
            directory: staticDirectory,
            watch: false,
          },
          port: '33333',
          host: 'localhost',
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.server.address();

      expect(address.address).toBe('127.0.0.1');
      expect(address.port).toBe(33333);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, done);
    });

    afterAll(testServer.close);
  });
});
