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

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
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

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
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

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
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

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
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
          port: 33333,
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

    it('Request to index', async () => {
      const res = await req.get('/');
      expect(res.status).toEqual(200);
    });

    afterAll(testServer.close);
  });
});
