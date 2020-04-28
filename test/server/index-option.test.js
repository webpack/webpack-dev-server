'use strict';

const { join } = require('path');
const request = require('supertest');
const config = require('../fixtures/index-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map')['index-option'];

describe('index option', () => {
  let server = null;
  let req = null;

  describe('should return index.html', () => {
    beforeAll((done) => {
      server = testServer.start(config, { port }, done);
      req = request(server.app);
    });

    it('Request to index', async () => {
      const { status, text } = await req.get('/');

      expect(status).toBe(200);
      // this file is too huge
      expect(text).not.toBe('');
    });

    afterAll(testServer.close);
  });

  describe('should return foo.html', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        { port, index: join(__dirname, '../fixtures/index-config/foo.html') },
        done
      );
      req = request(server.app);
    });

    it('Request to index', async () => {
      const { status, text } = await req.get('/');

      expect(status).toBe(200);
      expect(text).toMatchSnapshot();
    });

    afterAll(testServer.close);
  });

  describe('should throw an error', () => {
    beforeAll((done) => {
      server = testServer.start(config, { port, index: 'foo' }, done);
      req = request(server.app);
    });

    it('Request to index', async () => {
      const { status } = await req.get('/');

      expect(status).toBe(500);
    });

    afterAll(testServer.close);
  });
});
