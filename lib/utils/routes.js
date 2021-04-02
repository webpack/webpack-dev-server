'use strict';

const { createReadStream } = require('fs');
const { join } = require('path');

const clientBasePath = join(__dirname, '..', '..', 'client');

function routes(server) {
  const app = server.app;
  const middleware = server.middleware;

  app.get('/__webpack_dev_server__/sockjs.bundle.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');

    createReadStream(
      join(clientBasePath, 'modules/sockjs-client/index.js')
    ).pipe(res);
  });

  app.get('/webpack-dev-server/invalidate', (_req, res) => {
    server.invalidate();
    res.end();
  });

  app.get('/webpack-dev-server', (req, res) => {
    middleware.waitUntilValid((stats) => {
      res.setHeader('Content-Type', 'text/html');
      res.write(
        '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>'
      );

      const statsForPrint =
        typeof stats.stats !== 'undefined'
          ? stats.toJson().children
          : [stats.toJson()];

      res.write(`<h1>Assets Report:</h1>`);

      statsForPrint.forEach((item, index) => {
        res.write('<div>');
        res.write(
          `<h2>Compilation: '${item.name || `unnamed[${index}]`}'</h2>`
        );
        res.write('<ul>');

        const publicPath = item.publicPath === 'auto' ? '' : item.publicPath;

        for (const assets of item.assets) {
          res.write(
            `<li><a href="${publicPath + assets.name}" target="_blank">${
              assets.name
            }</a></li>`
          );
        }

        res.write('</ul>');
        res.write('</div>');
      });

      res.end('</body></html>');
    });
  });
}

module.exports = routes;
