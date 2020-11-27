'use strict';

function getStatsOption(configArr) {
  const isEmptyObject = (val) =>
    typeof val === 'object' && Object.keys(val).length === 0;

  // in webpack@4 stats will not be defined if not provided,
  // but in webpack@5 it will be an empty object
  const statsConfig = configArr.find(
    (conf) =>
      typeof conf === 'object' && conf.stats && !isEmptyObject(conf.stats)
  );
  return statsConfig ? statsConfig.stats : {};
}

module.exports = getStatsOption;
