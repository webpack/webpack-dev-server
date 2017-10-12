'use strict';

const fs = require('fs');
const path = require('path');
const Express = require('express');
const log = require('./log');
const { validateHost } = require('./util');

module.exports = function appSetup(options) {
  const app = new Express();

  app.all('*', (req, res, next) => {
    if (validateHost(req.headers, options)) {
      return next();
    }
    const message = `Invalid Host header: ${req.headers.host}`;
    log.error(message);
    res.send(message);
  });

  app.get('/__webpack_dev_server__/live.bundle.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    fs.createReadStream(path.join(__dirname, '..', 'client', 'live.bundle.js')).pipe(res);
  });

  app.get('/webpack-dev-server.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    fs.createReadStream(path.join(__dirname, '..', 'client', 'index.bundle.js')).pipe(res);
  });

  app.get('/webpack-dev-server/*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    fs.createReadStream(path.join(__dirname, '..', 'client', 'live.html')).pipe(res);
  });

  app.get('/webpack-dev-server', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>');
    const outputPath = this.middleware.getFilenameFromUrl(options.publicPath || '/');
    const filesystem = this.middleware.fileSystem;

    function writeDirectory(baseUrl, basePath) {
      const content = filesystem.readdirSync(basePath);
      res.write('<ul>');
      content.forEach((item) => {
        const p = `${basePath}/${item}`;
        if (filesystem.statSync(p).isFile()) {
          res.write('<li><a href="');
          res.write(baseUrl + item);
          res.write('">');
          res.write(item);
          res.write('</a></li>');
          if (/\.js$/.test(item)) {
            const htmlItem = item.substr(0, item.length - 3);
            res.write('<li><a href="');
            res.write(baseUrl + htmlItem);
            res.write('">');
            res.write(htmlItem);
            res.write('</a> (magic html for ');
            res.write(item);
            res.write(') (<a href="');
            res.write(baseUrl.replace(/(^(https?:\/\/[^\/]+)?\/)/, "$1webpack-dev-server/") + htmlItem); // eslint-disable-line
            res.write('">webpack-dev-server</a>)</li>');
          }
        } else {
          res.write('<li>');
          res.write(item);
          res.write('<br>');
          writeDirectory(`${baseUrl + item}/`, p);
          res.write('</li>');
        }
      });
      res.write('</ul>');
    }
    writeDirectory(options.publicPath || '/', outputPath);
    res.end('</body></html>');
  });

  return app;
};
