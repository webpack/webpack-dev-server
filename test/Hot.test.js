'use strict';

const helper = require('./helper');
const config = require('./fixtures/client-config/webpack.config');
const multiCompilerConfig = require('./fixtures/multi-compiler-config/webpack.config');
const runBrowser = require('./helpers/run-browser');

describe('Hot Module Replacement', () => {
  describe('simple hot config', () => {
    jest.setTimeout(30000);

    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        hot: true,
      };
      helper.start(config, options, done);
    });

    afterAll(helper.close);

    it('should log that it is using HMR to the console as first message', (done) => {
      runBrowser().then(({ page, browser }) => {
        page.once('console', (msg) => {
          expect(msg.args().length).toEqual(1);
          expect(msg.text()).toMatch(/\[HMR\]/);
          browser.close();
          done();
        });
        page.goto('http://localhost:9000/main');
      });
    });
  });

  describe('multi compiler hot config', () => {
    jest.setTimeout(30000);

    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        hot: true,
      };
      helper.start(multiCompilerConfig, options, done);
    });

    afterAll(helper.close);

    it('should log that it is using HMR to the console as first message', (done) => {
      runBrowser().then(({ page, browser }) => {
        page.once('console', (msg) => {
          expect(msg.args().length).toEqual(1);
          expect(msg.text()).toMatch(/\[HMR\]/);
          browser.close();
          done();
        });
        page.goto('http://localhost:9000/main');
      });
    });
  });

  describe('hot disabled', () => {
    jest.setTimeout(30000);

    beforeAll((done) => {
      const options = {
        port: 9000,
        host: '0.0.0.0',
        hot: false,
      };
      helper.start(config, options, done);
    });

    afterAll(helper.close);

    it('should not log HMR use to the console', (done) => {
      runBrowser().then(({ page, browser }) => {
        page.once('console', (msg) => {
          expect(msg.args().length).toEqual(1);
          expect(msg.text()).toMatch(/Hey\./);
          browser.close();
          done();
        });
        page.goto('http://localhost:9000/main');
      });
    });
  });
});
