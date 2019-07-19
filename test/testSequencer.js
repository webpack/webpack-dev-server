'use strict';

/* eslint-disable import/no-extraneous-dependencies, class-methods-use-this */

const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);
    const len = copyTests.length;
    const endToEndTests = copyTests.filter((test) =>
      test.path.includes('/e2e/')
    );
    const nonEndToEndTests = copyTests.filter(
      (test) => !test.path.includes('/e2e/')
    );

    // bring the most unstable test to the front
    const str = 'e2e/Client.test.js';
    endToEndTests.sort((testA, testB) => {
      if (testB.path.includes(str)) {
        return 1;
      }

      return -1;
    });

    const res = [];

    const spacing = Math.ceil(len / endToEndTests.length);

    let endToEndIndex = 0;
    let nonEndToEndIndex = 0;
    for (let i = 0; i < len; i++) {
      if (i % spacing === 0 && endToEndIndex < endToEndTests.length) {
        res.push(endToEndTests[endToEndIndex]);
        endToEndIndex += 1;
      } else if (nonEndToEndIndex < nonEndToEndTests.length) {
        res.push(nonEndToEndTests[nonEndToEndIndex]);
        nonEndToEndIndex += 1;
      }
    }

    return res;
  }
}

module.exports = CustomSequencer;
