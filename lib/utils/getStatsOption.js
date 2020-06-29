'use strict';

function getStatsOption(configArr) {
  const statsConfig = configArr.find(
    (conf) => typeof conf === 'object' && conf.stats
  );
  return statsConfig ? statsConfig.stats : {};
}

module.exports = getStatsOption;
