'use strict';

const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);
    const str = 'e2e/Client.test.js';
    return copyTests.sort((testA, testB) => {
        if (testA.path.includes(str)) {
            return -1;
        }
        else if (testB.path.includes(str)) {
            return 1;
        }

        return 0;
    });
  }
}

module.exports = CustomSequencer;