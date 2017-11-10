'use strict';

/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const marked = require('marked');
const webpack = require('webpack');

module.exports = {
  setup(config) {
    const defaults = { plugins: [], devServer: {} };
    const result = Object.assign(defaults, config);
    const before = function before(app) {
      app.get('/.assets/*', (req, res) => {
        const filename = path.join(__dirname, '/', req.path);
        res.sendFile(filename);
      });
    };
    const renderer = new marked.Renderer();
    const heading = renderer.heading;
    const markedOptions = {
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      sanitizer: null,
      mangle: true,
      smartLists: false,
      silent: false,
      langPrefix: 'lang-',
      smartypants: false,
      headerPrefix: '',
      renderer,
      xhtml: false
    };
    const readme = fs.readFileSync('README.md', 'utf-8');

    let exampleTitle = '';

    renderer.heading = function headingProxy(text, level, raw) {
      if (level === 1 && !exampleTitle) {
        exampleTitle = text;
      }

      return heading.call(this, text, level, raw);
    };

    marked.setOptions(markedOptions);

    marked(readme, { renderer });

    result.plugins.push(new webpack.NamedModulesPlugin());
    result.plugins.push(new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, '.assets/layout.html'),
      title: exampleTitle
    }));

    if (result.devServer.before) {
      const proxy = result.devServer.before;
      result.devServer.before = function replace(app) {
        before(app);
        proxy(app);
      };
    } else {
      result.devServer.before = before;
    }

    result.output = { path: path.dirname(module.parent.filename) };

    return result;
  }
};
