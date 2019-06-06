'use strict';

/* global self */

const sendMessage = require('../../../client-src/default/utils/sendMessage');

describe('sendMessage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should run self.postMessage', () => {
    self.postMessage = jest.fn();

    sendMessage('foo', 'bar');

    expect(self.postMessage).toBeCalled();
    expect(self.postMessage.mock.calls[0]).toMatchSnapshot();
  });
});
