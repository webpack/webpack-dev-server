"use strict";

const { testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-open"];

describe('"open" CLI option', () => {
  it('should work using "--open"', async () => {
    const { exitCode, killed } = await testBin(["--port", port, "--open"]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open /index.html"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open",
      "/index.html",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open /first.html second.html"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open",
      "/first.html",
      "second.html",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--no-open"', async () => {
    const { exitCode, killed } = await testBin(["--no-open", "--port", port]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-reset --open /third.html"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-reset",
      "--open",
      "/third.html",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-reset --open-target <url>"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-reset",
      "--open-target",
      "<url>",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-reset --open-target /third.html"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-reset",
      "--open-target",
      "/third.html",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-app-name google-chrome"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-app-name",
      "google-chrome",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-app-name-reset --open-app-name firefox"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-app-name-reset",
      "--open-app-name",
      "firefox",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-target index.html"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-target",
      "index.html",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-target-reset --open-target first.html"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-target-reset",
      "--open-target",
      "first.html",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-target /first.html second.html"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-target",
      "/first.html",
      "second.html",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--open-target /index.html --open-app-name google-chrome"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--open-target",
      "/index.html",
      "--open-app-name",
      "google-chrome",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });
});
