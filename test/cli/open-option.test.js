'use strict';

const { testBin } = require('../helpers/test-bin');

describe('open option', () => {
  it('--open', async () => {
    const { exitCode } = await testBin(['--open']);

    expect(exitCode).toEqual(0);
  });

  it('--open /index.html', async () => {
    const { exitCode } = await testBin('--open /index.html');

    expect(exitCode).toEqual(0);
  });

  it('--open /first.html second.html', async () => {
    const { exitCode } = await testBin('--open /first.html second.html');

    expect(exitCode).toEqual(0);
  });

  it('--no-open', async () => {
    const { exitCode } = await testBin('--no-open');

    expect(exitCode).toEqual(0);
  });

  it('--open-reset', async () => {
    const { exitCode } = await testBin('--open-reset --open /third.html');

    expect(exitCode).toEqual(0);
  });

  it('--open-reset --open-target', async () => {
    const { exitCode } = await testBin('--open-reset --open-target');

    expect(exitCode).toEqual(0);
  });

  it('--open-reset --open-target <value>', async () => {
    const { exitCode } = await testBin(
      '--open-reset --open-target /third.html'
    );

    expect(exitCode).toEqual(0);
  });

  it('--open-app google-chrome', async () => {
    const { exitCode } = await testBin('--open-app google-chrome');

    expect(exitCode).toEqual(0);
  });

  it('--open-app-name google-chrome', async () => {
    const { exitCode } = await testBin('--open-app-name google-chrome');

    expect(exitCode).toEqual(0);
  });

  it('--open-app-name-reset', async () => {
    const { exitCode } = await testBin(
      '-open-app-name-reset --open-app-name firefox'
    );

    expect(exitCode).toEqual(0);
  });

  it('--open-target', async () => {
    const { exitCode } = await testBin('-open-target');

    expect(exitCode).toEqual(0);
  });

  it('--no-open-target', async () => {
    const { exitCode } = await testBin('--no-open-target');

    expect(exitCode).toEqual(0);
  });

  it('--open-target index.html', async () => {
    const { exitCode } = await testBin('--open-target index.html');

    expect(exitCode).toEqual(0);
  });

  it('--open-target-reset', async () => {
    const { exitCode } = await testBin(
      '--open-target-reset --open-target first.html'
    );

    expect(exitCode).toEqual(0);
  });

  it('--open-target /first.html second.html', async () => {
    const { exitCode } = await testBin('--open-target /first.html second.html');

    expect(exitCode).toEqual(0);
  });

  it('--open-target /index.html --open-app google-chrome', async () => {
    const { exitCode } = await testBin(
      '--open-target /index.html --open-app google-chrome'
    );

    expect(exitCode).toEqual(0);
  });

  it('--open-target /index.html --open-app-name google-chrome', async () => {
    const { exitCode } = await testBin(
      '--open-target /index.html --open-app-name google-chrome'
    );

    expect(exitCode).toEqual(0);
  });

  it('--open-target /index.html --open-app google-chrome --open-app-name google-chrome', async () => {
    const { exitCode } = await testBin(
      '--open-target /index.html --open-app google-chrome --open-app-name google-chrome'
    );

    expect(exitCode).toEqual(0);
  });
});
