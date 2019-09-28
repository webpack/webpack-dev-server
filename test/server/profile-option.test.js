'use strict';

const webpack = require('webpack');
const Server = require('../../lib/Server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['profile-option'];

describe('profile', () => {
  describe('output', () => {
    let mockStderr;

    beforeAll(() => {
      mockStderr = jest
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => {});
    });

    it('should show percentage progress with profile data', (done) => {
      const compiler = webpack(config);
      const server = new Server(compiler, {
        port,
        // profile will only have an effect when progress is enabled
        progress: true,
        profile: true,
        quiet: true,
      });

      compiler.hooks.done.tap('webpack-dev-server', () => {
        const calls = mockStderr.mock.calls;
        mockStderr.mockRestore();
        let foundProgress = false;
        let foundProfile = false;

        calls.forEach((call) => {
          const text = call[0];

          if (text.includes('0% compiling')) {
            foundProgress = true;
          }

          // this is an indicator that the profile option is enabled,
          // so we should expect to find it in stderr since profile is enabled
          if (text.includes('after chunk modules optimization')) {
            foundProfile = true;
          }
        });

        expect(foundProgress).toBeTruthy();
        expect(foundProfile).toBeTruthy();

        server.close(done);
      });

      compiler.run(() => {});
      server.listen(port, 'localhost');
    });
  });
});
