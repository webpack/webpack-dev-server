'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['progress-option'];

describe('progress', () => {
  describe('output', () => {
    let mockStderr;

    beforeAll(() => {
      mockStderr = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => {});
    });

    it('should show percentage progress without profile data', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler, {
        port,
        progress: true,
        quiet: true,
      });

      compiler.hooks.done.tap('webpack-dev-server', () => {
        const calls = mockStderr.mock.calls;
        mockStderr.mockRestore();
        let foundProgress = false;
        let foundProfile = false;
        calls.forEach((call) => {
          if (call[0].includes('0% compiling')) {
            foundProgress = true;
          }

          // this is an indicator that the profile option is enabled,
          // so we should expect to not find it in stderr since it is not enabled
          if (call[0].includes('ms after chunk modules optimization')) {
            foundProfile = true;
          }
        });
        expect(foundProgress).toBeTruthy();
        expect(foundProfile).toBeFalsy();

        server.close(done);
      });

      compiler.run(() => {});
      server.listen(port, 'localhost');
    });
  });
});
