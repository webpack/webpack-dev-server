import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/react-refresh-config/webpack.config.js";
import runBrowser from "../helpers/run-browser.js";
import waitFor from "../helpers/wait-for.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap["react-refresh"];
const fixture = path.resolve(__dirname, "../fixtures/react-refresh-config");
const files = {
  app: path.join(fixture, "App.js"),
  child: path.join(fixture, "Child.js"),
  label: path.join(fixture, "label.js"),
};

/**
 * A component with state of its own, which Fast Refresh keeps across an edit.
 * @param {string} text what the button says before the count
 * @param {{ hooks?: boolean, crash?: boolean }=} options a second hook, which changes the component's hook signature; or a render that throws
 * @returns {string} the module's source
 */
function component(text, { hooks = false, crash = false } = {}) {
  return `import { createElement, useState } from "react";
import Child from "./Child.js";

export default function App() {
  const [count, setCount] = useState(0);
${hooks ? '  const [other] = useState("other");\n' : ""}${crash ? '  throw new Error("Render failed on purpose");\n' : ""}
  return createElement(
    "div",
    null,
    createElement(
      "button",
      { id: "counter", onClick: () => setCount(count + 1) },
      ${JSON.stringify(text)} + " " + count,
    ),
    createElement(Child),
  );
}
`;
}

/**
 * @param {string} text what the child says
 * @returns {string} the module's source
 */
function child(text) {
  return `import { createElement } from "react";

export default function Child() {
  return createElement("p", { id: "child" }, ${JSON.stringify(text)});
}
`;
}

/**
 * @param {import("puppeteer").Page} page page
 * @param {string} selector what to read
 * @param {string} text what it should say
 * @returns {Promise<void>} resolved once it does
 */
function waitForText(page, selector, text) {
  return page
    .waitForFunction(
      (target, expected) =>
        document.querySelector(target)?.textContent === expected,
      { timeout: 60000, polling: 100 },
      selector,
      text,
    )
    .then(() => {});
}

/**
 * @param {import("puppeteer").Page} page page
 * @returns {Promise<import("puppeteer").Frame>} React Refresh's overlay, once it is up
 */
async function waitForOverlay(page) {
  const handle = await page.waitForSelector("#react-refresh-overlay", {
    timeout: 60000,
  });

  return handle.contentFrame();
}

/**
 * @param {import("puppeteer").Page} page page
 * @returns {Promise<void>} resolved once React Refresh's overlay is gone
 */
function waitForNoOverlay(page) {
  return page
    .waitForFunction(() => !document.querySelector("#react-refresh-overlay"), {
      timeout: 60000,
      polling: 100,
    })
    .then(() => {});
}

// `@pmmmwh/react-refresh-webpack-plugin` as its users have it: Fast Refresh
// applied through this server's client, and the plugin's overlay reading this
// server's messages off `webpack-dev-server/client/socket`. Each hot scenario
// a project relies on, so a change to the client that breaks one shows here.
describe("React Refresh", () => {
  let server;
  let browser;
  let page;
  let messages;
  let pageErrors;

  /**
   * Serve the app, open it, and give the component some state to lose.
   * @param {Record<string, unknown>=} options dev server options
   * @returns {Promise<void>} resolved once the count is 2
   */
  async function open(options = {}) {
    server = new Server({ port, ...options }, webpack(config));
    await server.start();

    ({ page, browser } = await runBrowser());
    messages = [];
    pageErrors = [];
    page.on("console", (message) => {
      messages.push(message.text());
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error);
    });

    // Not "networkidle0": a page on Server-Sent Events keeps its connection
    // open for good.
    await page.goto(`http://localhost:${port}/`, { waitUntil: "load" });
    await waitForText(page, "#counter", "Clicked 0");
    await page.click("#counter");
    await page.click("#counter");
    await waitForText(page, "#counter", "Clicked 2");
    await page.evaluate(() => {
      globalThis.notReloaded = true;
    });
  }

  /**
   * @returns {Promise<boolean>} whether the page is still the one `open` loaded
   */
  function notReloaded() {
    return page.evaluate(() => globalThis.notReloaded === true);
  }

  beforeEach(() => {
    fs.writeFileSync(files.app, component("Clicked"));
    fs.writeFileSync(files.child, child("child v1"));
    fs.writeFileSync(files.label, 'export const label = "first";\n');
  });

  afterEach(async () => {
    if (browser) {
      await browser.close();
    }

    if (server) {
      await server.stop();
    }

    browser = undefined;
    server = undefined;

    for (const file of Object.values(files)) {
      fs.rmSync(file, { force: true });
    }
  });

  it("keeps a component's state across an edit", async () => {
    await open();

    fs.writeFileSync(files.app, component("Pressed"));

    await waitForText(page, "#counter", "Pressed 2");

    expect(await notReloaded()).toBe(true);
    // Applied by the client in place, which says so under this server's name.
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /^\[webpack-dev-server\] Hot updated \d+ modules\.$/,
        ),
      ]),
    );
    expect(pageErrors).toEqual([]);
  });

  it("keeps it across several edits in a row", async () => {
    await open();

    for (const text of ["One", "Two", "Three"]) {
      fs.writeFileSync(files.app, component(text));
      await waitForText(page, "#counter", `${text} 2`);
    }

    await page.click("#counter");
    await waitForText(page, "#counter", "Three 3");

    expect(await notReloaded()).toBe(true);
    expect(pageErrors).toEqual([]);
  });

  it("updates a component in another module, and keeps its parent's state", async () => {
    await open();

    fs.writeFileSync(files.child, child("child v2"));

    await waitForText(page, "#child", "child v2");

    expect(await page.$eval("#counter", (node) => node.textContent)).toBe(
      "Clicked 2",
    );
    expect(await notReloaded()).toBe(true);
  });

  it("remounts a component whose hooks changed, without reloading the page", async () => {
    await open();

    // Fast Refresh cannot carry state across a different set of hooks, so it
    // starts the component over — in place.
    fs.writeFileSync(files.app, component("Hooked", { hooks: true }));

    await waitForText(page, "#counter", "Hooked 0");

    expect(await notReloaded()).toBe(true);
  });

  it("shows a build error in its overlay, and takes it down when fixed", async () => {
    await open();

    fs.writeFileSync(
      files.app,
      `${component("Pressed")}\nexport const broken = ;\n`,
    );

    const frame = await waitForOverlay(page);

    await frame.waitForFunction(
      () => document.body.textContent.includes("Failed to compile."),
      { timeout: 60000, polling: 100 },
    );

    expect(await frame.evaluate(() => document.body.textContent)).toContain(
      "Syntax error: Unexpected token",
    );

    fs.writeFileSync(files.app, component("Pressed"));

    await waitForText(page, "#counter", "Pressed 2");
    await waitForNoOverlay(page);

    expect(await notReloaded()).toBe(true);
  });

  it("shows an error thrown while rendering, and renders again once fixed", async () => {
    await open();

    fs.writeFileSync(files.app, component("Pressed", { crash: true }));

    const frame = await waitForOverlay(page);

    await frame.waitForFunction(
      () => document.body.textContent.includes("Render failed on purpose"),
      { timeout: 60000, polling: 100 },
    );

    fs.writeFileSync(files.app, component("Fixed"));

    // The failed root is rendered again by Fast Refresh, not by a reload.
    await page.waitForFunction(
      () => /^Fixed \d+$/.test(document.querySelector("#counter")?.textContent),
      { timeout: 60000, polling: 100 },
    );

    expect(await notReloaded()).toBe(true);
  });

  it("reloads the page for an edit no component accepts", async () => {
    await open();

    fs.writeFileSync(files.label, 'export const label = "second";\n');

    await page.waitForFunction(
      () => document.querySelector("#root")?.dataset.label === "second",
      { timeout: 60000, polling: 100 },
    );
    await waitForText(page, "#counter", "Clicked 0");

    expect(await page.evaluate(() => globalThis.notReloaded)).toBeUndefined();
    await waitFor(() =>
      messages.includes("[webpack-dev-server] Reloading page"),
    );
  });

  it("does not reload for an edit no component accepts with hot: only", async () => {
    await open({ hot: "only" });

    fs.writeFileSync(files.app, component("Pressed"));
    await waitForText(page, "#counter", "Pressed 2");

    fs.writeFileSync(files.label, 'export const label = "second";\n');

    await waitFor(() =>
      messages.some((message) => message.includes("label.js")),
    );

    expect(
      await page.evaluate(() => document.querySelector("#root").dataset.label),
    ).toBe("first");
    expect(await notReloaded()).toBe(true);
  });

  it("keeps state and shows build errors over Server-Sent Events", async () => {
    await open({ webSocketServer: "sse" });

    fs.writeFileSync(files.app, component("Pressed"));
    await waitForText(page, "#counter", "Pressed 2");

    fs.writeFileSync(
      files.app,
      `${component("Pressed")}\nexport const broken = ;\n`,
    );

    const frame = await waitForOverlay(page);

    await frame.waitForFunction(
      () => document.body.textContent.includes("Failed to compile."),
      { timeout: 60000, polling: 100 },
    );

    fs.writeFileSync(files.app, component("Again"));

    await waitForText(page, "#counter", "Again 2");
    await waitForNoOverlay(page);

    expect(await notReloaded()).toBe(true);
  });
});
