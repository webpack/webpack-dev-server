'use strict';

jest.mock('opn');
const open = require('opn');
const status = require('../lib/utils/status');

open.mockReturnValue('foo');
const catchMock = jest.fn(() => 'foo');
open.mockReturnValue({
  catch: catchMock,
});

const uri = 'http://127.0.0.1';
const log = {
  info: jest.fn(),
  warn: jest.fn(),
};

describe('status)', () => {
  beforeEach(() => {
    open.mockClear();
    catchMock.mockClear();
    log.info.mockClear();
    log.warn.mockClear();
  });
  describe('open', () => {
    it('should NOT call open if `open` is not passed in', () => {
      const options = {};
      status(uri, options, log, true);
      expect(open).not.toBeCalled();
    });
    it('should call open with the URI passed in', () => {
      const options = {
        open: true,
      };
      status(uri, options, log, true);
      expect(open).toBeCalledWith(uri, {});
    });
    it('should call open with no options if open:true', () => {
      const options = {
        open: true,
      };
      status(uri, options, log, true);
      expect(open).toBeCalledWith(uri, {});
    });
    it('should call open with app:"app_name" is open is a string ', () => {
      const options = {
        open: 'Google Chrome',
      };
      status(uri, options, log, true);
      expect(open).toBeCalledWith(uri, { app: 'Google Chrome' });
    });
    it('should call open with app:["app_name", "option"] is open is an array ', () => {
      const options = {
        open: { app: ['Google Chrome', 'incognito'] },
      };
      status(uri, options, log, true);
      expect(open).toBeCalledWith(uri, { app: ['Google Chrome', 'incognito'] });
    });
  });
});
