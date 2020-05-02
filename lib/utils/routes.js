'use strict';

const { createReadStream } = require('fs');
const { join } = require('path');

const clientBasePath = join(__dirname, '..', '..', 'client');

function routes(server) {
  const app = server.app;
  const middleware = server.middleware;
  const options = server.options;

  app.get('/__webpack_dev_server__/sockjs.bundle.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');

    createReadStream(join(clientBasePath, 'sockjs/sockjs.bundle.js')).pipe(res);
  });

  app.get('/webpack-dev-server.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');

    createReadStream(join(clientBasePath, 'default/index.bundle.js')).pipe(res);
  });

  app.get('/invalidate', (_req, res) => {
    server.invalidate();
    res.end();
  });

  app.get('/webpack-dev-server', (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    res.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>'
    );

    const outputPath = middleware.getFilenameFromUrl(options.publicPath || '/');
    const filesystem = middleware.fileSystem;

    writeDirectory(options.publicPath || '/', outputPath);

    res.end('</body></html>');

    function writeDirectory(baseUrl, basePath) {
      const content = filesystem.readdirSync(basePath);

      res.write('<ul>');

      content.forEach((item) => {
        const p = `${basePath}/${item}`;

        if (filesystem.statSync(p).isFile()) {
          res.write(`<li><a href="${baseUrl + item}">${item}</a></li>`);

          if (/\.js$/.test(item)) {
            const html = item.substr(0, item.length - 3);
            const containerHref = baseUrl + html;

            res.write(`<li><a href="${containerHref}">${html}</a>`);
          }
        } else {
          res.write(`<li>${item}<br>`);

          writeDirectory(`${baseUrl + item}/`, p);

          res.write('</li>');
        }
      });

      res.write('</ul>');
    }
  });
}

module.exports = routes;
