'use strict';

const createCertificate = require('../../../lib/utils/createCertificate');

describe('createCertificate', () => {
  it('should have keys', () => {
    expect(createCertificate([{ name: 'commonName', value: 'wds' }])).toEqual(
      expect.objectContaining({
        private: expect.any(String),
        public: expect.any(String),
        cert: expect.any(String),
        fingerprint: expect.any(String),
      })
    );
  });
});
