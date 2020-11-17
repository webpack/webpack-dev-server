/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Based on webpack/lib/DynamicEntryPlugin
	Author Naoyuki Kanezawa @nkzawa
*/

'use strict';

const webpack = require('webpack');

// @ts-ignore
const EntryPlugin = webpack.EntryPlugin;

class DevServerEntryPlugin {
  /**
   * @param {string} context context path
   * @param {string[]} entries entry paths
   * @param {?Object | string} options entry options
   */
  constructor(context, entries, options) {
    if (!EntryPlugin) {
      throw new Error(
        'DevServerEntryPlugin is supported in webpack 5 or greater'
      );
    }

    this.context = context;
    this.entries = entries;
    this.options = options || '';
  }

  /**
   * Apply the plugin
   * @param {Object} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    compiler.hooks.make.tapPromise('DevServerEntryPlugin', (compilation) =>
      Promise.all(
        this.entries.map(
          (entry) =>
            new Promise((resolve, reject) => {
              compilation.addEntry(
                this.context,
                EntryPlugin.createDependency(entry, this.options),
                this.options,
                (err) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            })
        )
      )
    );
  }
}

module.exports = DevServerEntryPlugin;
