'use strict';

/* eslint-disable import/no-extraneous-dependencies */

const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const marked = require('marked');
const webpack = require('webpack');

module.exports = {
  setup(config) {
    const defaults = { mode: 'development', plugins: [], devServer: {} };

    if (config.entry) {
      if (typeof config.entry === 'string') {
        config.entry = path.resolve(config.entry);
      } else if (Array.isArray(config.entry)) {
        config.entry = config.entry.map((entry) => path.resolve(entry));
      } else if (typeof config.entry === 'object') {
        Object.entries(config.entry).forEach(([key, value]) => {
          config.entry[key] = path.resolve(value);
        });
      }
    }

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
      xhtml: false,
    };
    const readme = fs.readFileSync('README.md', 'utf-8');

    let exampleTitle = '';

    renderer.heading = function headingProxy(text, level, raw, slugger) {
      if (level === 1 && !exampleTitle) {
        exampleTitle = text;
      }

      return heading.call(this, text, level, raw, slugger);
    };

    marked.setOptions(markedOptions);

    marked(readme, { renderer });

    result.plugins.push(new webpack.NamedModulesPlugin());
    result.plugins.push(
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.join(__dirname, '.assets/layout.html'),
        title: exampleTitle,
      })
    );

    if (result.devServer.before) {
      const proxy = result.devServer.before;
      result.devServer.before = function replace(app) {
        before(app);
        proxy(app);
      };
    } else {
      result.devServer.before = before;
    }

    const output = {
      path: path.dirname(module.parent.filename),
    };

    if (result.output) {
      Object.assign(result.output, output);
    } else {
      result.output = output;
    }

    return result;
  },
};
