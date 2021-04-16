'use strict';

const { join } = require('path');
const { createReadStream } = require('graceful-fs');

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

        const name =
          item.name || (stats.stats ? `unnamed[${index}]` : 'unnamed');

        res.write(`<h2>Compilation: ${name}</h2>`);
        res.write('<ul>');

        const publicPath = item.publicPath === 'auto' ? '' : item.publicPath;

        for (const asset of item.assets) {
          const assetName = asset.name;
          const assetURL = `${publicPath}${assetName}`;

          res.write(
            `<li>
              <strong><a href="${assetURL}" target="_blank">${assetName}</a></strong>
            </li>`
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
