'use strict';

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map').bundle;
const isWebpack5 = require('../helpers/isWebpack5');

describe('bundle', () => {
  // the ES5 check test for the bundle will not work on webpack@5,
  // because webpack@5 bundle output uses some ES6 syntax that can
  // only be avoided with babel-loader
  const runBundleTest = isWebpack5 ? describe.skip : describe;

  runBundleTest('index.bundle.js bundled output', () => {
    it('should parse with ES5', () => {
      const bundleStr = fs.readFileSync(
        path.resolve(__dirname, '../../client/default/index.bundle.js'),
        'utf8'
      );
      expect(() => {
        acorn.parse(bundleStr, {
          ecmaVersion: 5,
        });
      }).not.toThrow();
    });
  });

  runBundleTest('main.js bundled output', () => {
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
        .expect('Content-Type', 'application/javascript; charset=utf-8')
        .expect(200);

      expect(() => {
        let evalStep = 0;
        acorn.parse(text, {
          ecmaVersion: 5,
          onToken: (token) => {
            // a webpack bundle is a series of evaluated JavaScript
            // strings like this: eval('...')
            // if we want the bundle to work using ES5, we need to
            // check that these strings are good with ES5 as well

            // this can be done by waiting for tokens during the main parse
            // then when we hit a string in an 'eval' function we also try
            // to parse that string with ES5
            if (token.type.label === 'name' && token.value === 'eval') {
              evalStep += 1;
            } else if (token.type.label === '(' && evalStep === 1) {
              evalStep += 1;
            } else if (token.type.label === 'string' && evalStep === 2) {
              const program = token.value;
              acorn.parse(program, {
                ecmaVersion: 5,
              });

              evalStep = 0;
            }
          },
        });
      }).not.toThrow();
    });
  });
});
