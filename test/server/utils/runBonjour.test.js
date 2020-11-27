'use strict';

const runBonjour = require('../../../lib/utils/runBonjour');

jest.mock('os', () => {
  return {
    hostname: () => 'hostname',
  };
});

describe('runBonjour', () => {
  const mockPublish = jest.fn();
  const mockUnpublishAll = jest.fn();

  beforeAll(() => {
    jest.mock('bonjour', () => () => {
      return {
        publish: mockPublish,
        unpublishAll: mockUnpublishAll,
      };
    });
  });

  afterEach(() => {
    mockPublish.mockClear();
    mockUnpublishAll.mockClear();
  });

  it('should call bonjour.publish', () => {
    runBonjour({
      port: 1111,
    });

    expect(mockPublish.mock.calls[0][0]).toMatchSnapshot();
  });

  it('should call bonjour.publish with different name for different ports', () => {
    runBonjour({
      port: 1111,
    });
    runBonjour({
      port: 2222,
    });

    const calls = mockPublish.mock.calls;

    expect(calls[0][0].name).not.toEqual(calls[1][0].name);
  });
});
