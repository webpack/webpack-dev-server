'use strict';

const overlay = require('../../client-src/default/overlay');

describe('overlay', () => {
  it('should run showMessage', () => {
    expect(document.body.innerHTML).toMatchSnapshot();

    overlay.showMessage(['test!']);

    expect(
      document.getElementsByTagName('iframe')[0].contentDocument.body.innerHTML
    ).toMatchSnapshot();
  });

  it('should run clear', () => {
    overlay.showMessage(['test!']);

    expect(
      document.getElementsByTagName('iframe')[0].contentDocument.body.innerHTML
    ).toMatchSnapshot();

    overlay.clear();

    expect(document.body.innerHTML).toMatchSnapshot();
  });
});
