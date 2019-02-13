'use strict';

const { setup } = require('../../util');

const appConfig = setup({
  name: 'Your app',
  entry: './app.js',
});
Object.assign(appConfig.output, {
  publicPath: '/',
});

const devToolsConfig = setup({
  name: 'Your custom devTools',
  entry: './devTools.js',
  devServer: {
    before: function before(app, server) {
      server.subscribeClientData(({ message }) => {
        switch (message.type) {
          case 'log':
            return console.log(message.data);
          case 'keypress':
            return server.sockWrite(server.sockets, 'custom', message);
          default:
        }
      });
    },
  },
});
Object.assign(devToolsConfig.output, {
  path: `${devToolsConfig.output.path}/devtools`,
  publicPath: '/devtools',
});

module.exports = function createConfigs(env, argv) {
  return [].concat(argv.mode === 'production' ? [] : devToolsConfig, appConfig);
};
