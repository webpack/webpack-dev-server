'use strict';

const acorn = require('acorn');
const request = require('supertest');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map').bundle;
const isWebpack5 = require('../helpers/isWebpack5');

describe('bundle', () => {
  describe('main.js bundled output', () => {
    let server;
    let req;

    beforeAll((done) => {
      server = testServer.start(
        { ...config, target: isWebpack5 ? ['es5', 'web'] : 'web' },
        { port },
        done
      );
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
