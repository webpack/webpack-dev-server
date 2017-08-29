'use strict';

const assert = require('assert');
const path = require('path');
const request = require('supertest');
const helper = require('./helper');
const config = require('./fixtures/historyapifallback-config/webpack.config');
const config2 = require('./fixtures/historyapifallback-2-config/webpack.config');
const config3 = require('./fixtures/historyapifallback-3-config/webpack.config');

describe('HistoryApiFallback', () => {
  let server;
  let req;

  afterEach(helper.close);

  describe('as boolean', () => {
    before((done) => {
      server = helper.start(config, {
        historyApiFallback: true
      }, done);
      req = request(server.app);
    });

    it('request to directory', (done) => {
      req.get('/foo')
        .accept('html')
        .expect(200, /Heyyy/, done);
    });
  });

  describe('as object', () => {
    before((done) => {
      server = helper.start(config, {
        historyApiFallback: {
          index: '/bar.html'
        }
      }, done);
      req = request(server.app);
    });

    it('request to directory', (done) => {
      req.get('/foo')
        .accept('html')
        .expect(200, /Foobar/, done);
    });
  });

  describe('as object with contentBase', () => {
    before((done) => {
      server = helper.start(config2, {
        contentBase: path.join(__dirname, 'fixtures/historyapifallback-2-config'),
        historyApiFallback: {
          index: '/bar.html'
        }
      }, done);
      req = request(server.app);
    });

    it('historyApiFallback should take preference above directory index', (done) => {
      req.get('/')
        .accept('html')
        .expect(200, /Foobar/, done);
    });

    it('request to directory', (done) => {
      req.get('/foo')
        .accept('html')
        .expect(200, /Foobar/, done);
    });

    it('contentBase file should take preference above historyApiFallback', (done) => {
      req.get('/random-file')
        .accept('html')
        .end((err, res) => { // eslint-disable-line
          if (err) {
            done(err);
          }
          assert(res.body.toString(), 'Random file');
          done();
        });
    });
  });

  describe('as object with contentBase set to false', () => {
    before((done) => {
      server = helper.start(config3, {
        contentBase: false,
        historyApiFallback: {
          index: '/bar.html'
        }
      }, done);
      req = request(server.app);
    });

    it('historyApiFallback should work and ignore static content', (done) => {
      req.get('/index.html')
        .accept('html')
        .expect(200, /In-memory file/, done);
    });
  });

  describe('as object with contentBase and rewrites', () => {
    before((done) => {
      server = helper.start(config2, {
        contentBase: path.join(__dirname, 'fixtures/historyapifallback-2-config'),
        historyApiFallback: {
          rewrites: [
            {
              from: /other/,
              to: '/other.html'
            },
            {
              from: /.*/,
              to: '/bar.html'
            }
          ]
        }
      }, done);
      req = request(server.app);
    });

    it('historyApiFallback respect rewrites for index', (done) => {
      req.get('/')
        .accept('html')
        .expect(200, /Foobar/, done);
    });

    it('historyApiFallback respect rewrites and shows index for unknown urls', (done) => {
      req.get('/acme')
        .accept('html')
        .expect(200, /Foobar/, done);
    });

    it('historyApiFallback respect any other specified rewrites', (done) => {
      req.get('/other')
        .accept('html')
        .expect(200, /Other file/, done);
    });
  });

  describe('in-memory files', () => {
    before((done) => {
      server = helper.start(config3, {
        contentBase: path.join(__dirname, 'fixtures/historyapifallback-3-config'),
        historyApiFallback: true
      }, done);
      req = request(server.app);
    });

    it('should take precedence over contentBase files', (done) => {
      req.get('/foo')
        .accept('html')
        .expect(200, /In-memory file/, done);
    });
  });
});
