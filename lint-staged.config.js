'use strict';

module.exports = {
  '*.js': ['prettier --write', 'eslint --fix', 'git add'],
  '*.{json,md,yml,css}': ['prettier --write', 'git add'],
};
