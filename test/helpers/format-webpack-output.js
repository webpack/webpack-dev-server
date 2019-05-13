/* eslint-disable no-control-regex */

'use strict';

// https://github.com/webpack/webpack/blob/master/test/StatsTestCases.test.js

const { join } = require('path');

const base = new RegExp(`${join(process.cwd())}`, ['g']);

function formatWebpackOutput(str) {
  return str
    .replace(/\u001b\[1m\u001b\[([0-9;]*)m/g, '<CLR=$1,BOLD>')
    .replace(/\u001b\[1m/g, '<CLR=BOLD>')
    .replace(/\u001b\[39m\u001b\[22m/g, '</CLR>')
    .replace(/\u001b\[([0-9;]*)m/g, '<CLR=$1>')
    .replace(/[0-9]+(<\/CLR>)?(\s?ms)/g, 'X$1$2')
    .replace(
      /^(\s*Built at:) (.*)$/gm,
      '$1 Thu Jan 01 1970 <CLR=BOLD>00:00:00</CLR> GMT'
    )
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]*Version:.+\n/g, '')
    .replace(base, 'xDir')
    .replace(/ dependencies:Xms/g, '');
}

module.exports = formatWebpackOutput;
