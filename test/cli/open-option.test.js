'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"open" CLI option', () => {
  it('should work using "--open"', async () => {
    const { exitCode } = await testBin(['--open']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open /index.html"', async () => {
    const { exitCode } = await testBin('--open /index.html');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open /first.html second.html"', async () => {
    const { exitCode } = await testBin('--open /first.html second.html');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-open"', async () => {
    const { exitCode } = await testBin('--no-open');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-reset"', async () => {
    const { exitCode } = await testBin('--open-reset --open /third.html');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-reset --open-target"', async () => {
    const { exitCode } = await testBin('--open-reset --open-target');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-reset --open-target /third.html"', async () => {
    const { exitCode } = await testBin(
      '--open-reset --open-target /third.html'
    );

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-app google-chrome"', async () => {
    const { exitCode } = await testBin('--open-app google-chrome');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-app-name google-chrome"', async () => {
    const { exitCode } = await testBin('--open-app-name google-chrome');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-app-name-reset --open-app-name firefox"', async () => {
    const { exitCode } = await testBin(
      '-open-app-name-reset --open-app-name firefox'
    );

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-target"', async () => {
    const { exitCode } = await testBin('-open-target');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-open-target"', async () => {
    const { exitCode } = await testBin('--no-open-target');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-target index.html"', async () => {
    const { exitCode } = await testBin('--open-target index.html');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-target-reset"', async () => {
    const { exitCode } = await testBin(
      '--open-target-reset --open-target first.html'
    );

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-target /first.html second.html"', async () => {
    const { exitCode } = await testBin('--open-target /first.html second.html');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-target /index.html --open-app google-chrome"', async () => {
    const { exitCode } = await testBin(
      '--open-target /index.html --open-app google-chrome'
    );

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-target /index.html --open-app-name google-chrome"', async () => {
    const { exitCode } = await testBin(
      '--open-target /index.html --open-app-name google-chrome'
    );

    expect(exitCode).toEqual(0);
  });

  it('should work using "--open-target /index.html --open-app google-chrome --open-app-name google-chrome"', async () => {
    const { exitCode } = await testBin(
      '--open-target /index.html --open-app google-chrome --open-app-name google-chrome'
    );

    expect(exitCode).toEqual(0);
  });
});
