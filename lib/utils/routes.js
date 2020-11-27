'use strict';

const { createReadStream } = require('fs');
const { join } = require('path');
const getPaths = require('webpack-dev-middleware/dist/utils/getPaths').default;

const clientBasePath = join(__dirname, '..', '..', 'client');

function routes(server) {
  const app = server.app;
  const middleware = server.middleware;

  app.get('/__webpack_dev_server__/sockjs.bundle.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');

    createReadStream(join(clientBasePath, 'sockjs/sockjs.bundle.js')).pipe(res);
  });

  app.get('/webpack-dev-server.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');

    createReadStream(join(clientBasePath, 'default/index.bundle.js')).pipe(res);
  });

  app.get('/webpack-dev-server/invalidate', (_req, res) => {
    server.invalidate();
    res.end();
  });

  app.get('/webpack-dev-server', (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    res.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>'
    );

    const filesystem = middleware.context.outputFileSystem;
    const paths = getPaths(middleware.context);

    for (const { publicPath, outputPath } of paths) {
      writeDirectory(publicPath, outputPath);
    }

    res.end('</body></html>');

    function writeDirectory(baseUrl, basePath) {
      if (baseUrl === 'auto') {
        baseUrl = '';
      }

      const content = filesystem.readdirSync(basePath);

      res.write('<ul>');

      // sort file data so that files are listed before directories
      // this forces Windows to have consistent behavior, as it seems
      // to list directories first for the default memfs filesystem
      // of webpack-dev-middleware
      const fileData = content
        .map((item) => {
          const p = `${basePath}/${item}`;
          return {
            item,
            isFile: filesystem.statSync(p).isFile(),
            path: p,
          };
        })
        .sort((item1, item2) => {
          if (item1.isFile && !item2.isFile) {
            return -1;
          } else if (!item1.isFile && item2.isFile) {
            return 1;
            // sort alphabetically if both are files or directories
          } else if (item1.item < item2.item) {
            return -1;
          } else if (item2.item < item1.item) {
            return 1;
          }
          return 0;
        });

      fileData.forEach((data) => {
        const { item, isFile, path: p } = data;

        if (isFile) {
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
