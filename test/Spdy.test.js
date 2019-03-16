'use strict';

const path = require('path');
const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/contentbase-config/webpack.config');

const contentBasePublic = path.join(
  __dirname,
  'fixtures/contentbase-config/public'
);

describe('SPDY', () => {
  let server;
  let req;

  describe('spdy works with https', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: true,
          spdy: true,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });

    afterAll(() => {
      helper.close();
    });
  });

  describe('spdy ignored without https', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          spdy: true,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });

    afterAll(() => {
      helper.close();
    });
  });

  describe('http2 alias for spdy', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: true,
          http2: true,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });

    afterAll(() => {
      helper.close();
    });
  });

  describe('custom spdy protocol options', () => {
    beforeAll((done) => {
      server = helper.start(
        config,
        {
          contentBase: contentBasePublic,
          https: {
            spdy: {
              protocols: ['http/1.1'],
            },
          },
          spdy: true,
        },
        done
      );
      req = request(server.app);
    });

    it('Request to index', (done) => {
      req.get('/').expect(200, /Heyo/, done);
    });

    afterAll(() => {
      helper.close();
    });
  });

  afterEach(helper.close);
});
