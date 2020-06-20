'use strict';

jest.setMock('../../../client/entry/bundle.js', jest.fn());

// this test file is separate from entry.test.js because it is
// difficult to set new globals or delete globals with jest
global.__resourceQuery = 'test1';

const bundle = require('../../../client/entry/bundle');

describe('entry without emitter', () => {
  describe('module', () => {
    it('should pass resource query to bundle without emitter', () => {
      require('../../../client/entry');
      expect(bundle.mock.calls.length).toEqual(1);
      expect(bundle.mock.calls[0]).toEqual(['test1', null]);
    });
  });
});
