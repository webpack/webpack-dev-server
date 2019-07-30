'use strict';

const runBonjour = require('../../../lib/utils/runBonjour');

describe('runBonjour', () => {
  let mock;
  let publish = jest.fn();
  let unpublishAll = jest.fn();

  beforeAll(() => {
    mock = jest.mock('bonjour', () => () => {
      return {
        publish,
        unpublishAll,
      };
    });
  });

  afterEach(() => {
    publish = jest.fn();
    unpublishAll = jest.fn();
  });

  afterAll(() => {
    mock.mockRestore();
  });

  it('should call bonjour.publish', () => {
    runBonjour({
      port: 1111,
    });

    expect(publish.mock.calls[0][0]).toMatchSnapshot();
  });
});
