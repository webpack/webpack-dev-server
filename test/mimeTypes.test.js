'use strict';

const path = require('path');
const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/mimetypes-config/webpack.config');

describe('mimeTypes', () => {
  let server;
  let req;

  before((done) => {
    server = helper.start(config, {
      mimeTypes: {
        'text/html': ['phtml']
      },
      contentBase: path.join(__dirname, 'fixtures/mimetypes-config')
    }, done);
    req = request(server.app);
  });

  after(helper.close);

  it('request to phtml file', (done) => {
    req.get('/test.phtml')
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect(200, done);
  });

  it('request to phtml file', (done) => {
    req.get('/test.phtml')
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect(200, done);
  });
});
