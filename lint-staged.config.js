'use strict';

module.exports = {
  ignore: ['package-lock.json', 'CHANGELOG.md'],
  linters: {
    '*.js': ['prettier --write', 'eslint --fix', 'git add'],
    '*.{json,md,yml,css}': ['prettier --write', 'git add'],
  },
};
