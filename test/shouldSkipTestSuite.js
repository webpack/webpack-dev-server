'use strict';

const semver = require('semver');

// issue: https://github.com/nodejs/node/issues/24835
function shouldSkipTestSuite() {
  if (
    semver.satisfies(process.version, '11') &&
    process.platform === 'darwin'
  ) {
    it('skip', () => {
      expect(true).toBeTruthy();
    });

    return true;
  }
  return false;
}

module.exports = shouldSkipTestSuite;
