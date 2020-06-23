'use strict';

const acorn = require('acorn');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map').bundle;
const isWebpack5 = require('../helpers/isWebpack5');

describe('bundle', () => {
  // the ES5 check test for the bundle will not work on webpack@5,
  // because webpack@5 bundle output uses some ES6 syntax
  const runBundleTest = isWebpack5 ? describe.skip : describe;

  runBundleTest('bundled output', () => {
    let server;
    let req;

    beforeAll((done) => {
      server = testServer.start(config, { port }, done);
      req = request(server.app);
    });

    afterAll(testServer.close);

    it('should get full user bundle and parse with ES5', async () => {
      const { text } = await req
        .get('/main.js')
        .expect('Content-Type', 'application/javascript; charset=UTF-8')
        .expect(200);

      expect(() => {
        let evalStep = 0;
        acorn.parse(text, {
          ecmaVersion: 5,
          onToken: (token) => {
            if (token.type.label === 'name' && token.value === 'eval') {
              evalStep += 1;
            } else if (token.type.label === '(' && evalStep === 1) {
              evalStep += 1;
            } else if (token.type.label === 'string' && evalStep === 2) {
              const program = token.value;
              try {
                acorn.parse(program, {
                  ecmaVersion: 5,
                });
              } catch (e) {
                console.log(program);
              }

              evalStep = 0;
            }
          },
        });
      }).not.toThrow();
    });
  });
});
