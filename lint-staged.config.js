'use strict';

module.exports = {
  '*.js': ['prettier --write', 'eslint --fix'],
  '*.{json,md,yml,css}': ['prettier --write'],
};
