'use strict';

const getStatsOption = require('./getStatsOption');

function getColorsOption(configArr) {
  const statsOption = getStatsOption(configArr);
  let colors = false;
  if (typeof statsOption === 'object' && statsOption.colors) {
    colors = statsOption.colors;
  }

  return colors;
}

module.exports = getColorsOption;
