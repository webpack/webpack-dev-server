'use strict';

const getCurrentScriptSource = require('../../../client-src/default/utils/getCurrentScriptSource');

describe('getCurrentScriptSource', () => {
  afterEach(() => {
    Object.defineProperty(document, 'currentScript', {
      value: null,
      writable: true,
    });
    Object.defineProperty(document, 'scripts', {
      value: [],
      writable: true,
    });
  });

  test("should fail when script source doesn't exist", () => {
    try {
      getCurrentScriptSource();
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  test('should return src if document.currentScript exists', () => {
    const elm = document.createElement('script');
    elm.setAttribute('src', 'foo');

    Object.defineProperty(document, 'currentScript', {
      value: elm,
    });

    expect(getCurrentScriptSource()).toEqual('foo');
  });

  test('should return src', () => {
    const elms = ['foo', 'bar'].map((src) => {
      const elm = document.createElement('script');
      elm.setAttribute('src', src);
      return elm;
    });

    Object.defineProperty(document, 'scripts', {
      value: elms,
    });

    expect(getCurrentScriptSource()).toEqual('bar');
  });
});
