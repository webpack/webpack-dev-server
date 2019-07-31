'use strict';

const colors = require('../../../lib/utils/colors');

describe('colors', () => {
  describe('info', () => {
    it('should disable color', () => {
      expect(colors.info(false, 'test')).toMatchSnapshot();
    });

    it('should enable color', () => {
      expect(colors.info(true, 'test')).toMatchSnapshot();
    });
  });

  describe('error', () => {
    it('should disable color', () => {
      expect(colors.error(false, 'test')).toMatchSnapshot();
    });

    it('should enable color', () => {
      expect(colors.error(true, 'test')).toMatchSnapshot();
    });
  });
});
