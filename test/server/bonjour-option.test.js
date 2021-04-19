'use strict';

const os = require('os');
const config = require('../fixtures/simple-config/webpack.config');
const testServer = require('../helpers/test-server');
const port = require('../ports-map').bonjour;

describe('bonjour option', () => {
  let server;
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

  beforeEach((done) => {
    server = testServer.start(
      config,
      {
        bonjour: true,
        port,
      },
      done
    );
  });

  afterEach((done) => {
    mockPublish.mockReset();
    mockUnpublishAll.mockReset();
    server.close(done);
  });

  it('should call bonjour with correct params', () => {
    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledWith({
      name: `Webpack Dev Server ${os.hostname()}:${port}`,
      port,
      type: 'http',
      subtypes: ['webpack'],
    });
    expect(mockUnpublishAll).toHaveBeenCalledTimes(0);
  });
});
