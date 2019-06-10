'use strict';

const request = require('supertest');
const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map')['host-option'];

describe('host option', () => {
  let server = null;
  let req = null;

  describe('is not be specified', () => {
    beforeAll((done) => {
      server = testServer.start(config, { port }, done);
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

  describe('is undefined', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          // eslint-disable-next-line no-undefined
          host: undefined,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.listeningApp.address();

      expect(address.address).toBe('::');
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      await req.get('/').expect(200);
    });

    afterAll(testServer.close);
  });

  describe('is null', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          host: null,
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.listeningApp.address();

      expect(address.address).toBe('::');
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      await req.get('/').expect(200);
    });

    afterAll(testServer.close);
  });

  describe('is 127.0.0.1 (IPv4)', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          host: '127.0.0.1',
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

    it('Request to index', async () => {
      await req.get('/').expect(200);
    });

    afterAll(testServer.close);
  });

  describe('is localhost', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          host: 'localhost',
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

    it('Request to index', async () => {
      await req.get('/').expect(200);
    });

    afterAll(testServer.close);
  });

  describe('is 0.0.0.0', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          host: '0.0.0.0',
          port,
        },
        done
      );
      req = request(server.app);
    });

    it('server address', () => {
      const address = server.listeningApp.address();

      expect(address.address).toBe('0.0.0.0');
      expect(address.port).toBe(port);
    });

    it('Request to index', async () => {
      await req.get('/').expect(200);
    });

    afterAll(testServer.close);
  });
});
