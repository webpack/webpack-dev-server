/**
 * @jest-environment jsdom
 */

'use strict';

const overlay = require('../../client-src/overlay');

describe('overlay', () => {
  it('should run showMessage', async () => {
    expect(document.body.innerHTML).toMatchSnapshot();

    overlay.showMessage(['test!']);

    await new Promise((r) => setTimeout(() => r()));

    expect(
      document.getElementsByTagName('iframe')[0].contentDocument.body.innerHTML
    ).toMatchSnapshot();
  });

  it('should run clear', async () => {
    overlay.showMessage(['test!']);

    expect(
      document.getElementsByTagName('iframe')[0].contentDocument.body.innerHTML
    ).toMatchSnapshot();

    overlay.clear();

    await new Promise((r) => setTimeout(() => r()));

    expect(document.body.innerHTML).toMatchSnapshot();
  });
});
