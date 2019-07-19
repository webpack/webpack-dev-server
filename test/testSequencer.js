'use strict';

/* eslint-disable import/no-extraneous-dependencies, class-methods-use-this */

const Sequencer = require('@jest/test-sequencer').default;

// The purpose of this sequencer is to spread end to end (e2e) tests evenly amongst
// other tests during the test run. Jest runs tests concurrently, but we want e2e tests
// to overlap as little as possible during this concurrent testing since e2e
// tests use lots of memory and tend to be more unstable
class CustomSequencer extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);
    const len = copyTests.length;

    const isEndToEndTest = (test) => {
      // backslash test for Windows
      return test.path.includes('/e2e/') || test.path.includes('\\e2e\\');
    };

    // seperate e2e and non-e2e tests into two separate arrays
    const endToEndTests = copyTests.filter(isEndToEndTest);
    const nonEndToEndTests = copyTests.filter((test) => !isEndToEndTest(test));

    // bring the most unstable test to the front
    endToEndTests.sort((testA, testB) => {
      // backslash test for Windows
      if (
        testB.path.includes('e2e/Client.test.js') ||
        testB.path.includes('e2e\\Client.test.js')
      ) {
        return 1;
      }

      return -1;
    });

    const res = [];

    // an e2e test will be placed into the resulting array at this spacing interval
    const spacing = Math.ceil(len / endToEndTests.length);

    let endToEndIndex = 0;
    let nonEndToEndIndex = 0;
    for (let i = 0; i < len; i++) {
      // push an e2e test into the resulting array if we have reached the correct index,
      // otherwise push a non-e2e test
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
