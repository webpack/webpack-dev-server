import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { expect } from "expect";
import request from "supertest";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import portsMap from "../ports-map.js";

const port = portsMap["static-deny"];
const origin = `http://localhost:${port}`;

describe("static.deny", () => {
  let directory;

  before(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "static-deny-"));

    for (const file of [
      ".env",
      ".env.local",
      "server.key",
      "cert.PEM",
      ".npmrc",
      ".git/config",
      "nested/.env.production",
      "index.txt",
      "notes.md",
      "listing/readme.txt",
      "listing/private.key",
    ]) {
      fs.mkdirSync(path.dirname(path.join(directory, file)), {
        recursive: true,
      });
      fs.writeFileSync(path.join(directory, file), file);
    }
  });

  after(() => {
    fs.rmSync(directory, { recursive: true, force: true });
  });

  async function serve(staticOptions) {
    const server = new Server(
      { port, static: { directory, ...staticOptions } },
      webpack(config),
    );

    await server.start();

    return server;
  }

  describe("left out, as it is by default", () => {
    let server;

    before(async () => {
      // Dotfiles allowed, to show `deny` is what keeps them out below.
      server = await serve({ staticOptions: { dotfiles: "allow" } });
    });

    after(async () => {
      await server.stop();
    });

    it("serves every file, as before", async () => {
      await request(origin).get("/.env").expect(200);
      await request(origin).get("/server.key").expect(200);
    });
  });

  describe("true", () => {
    let server;

    before(async () => {
      server = await serve({
        deny: true,
        staticOptions: { dotfiles: "allow" },
      });
    });

    after(async () => {
      await server.stop();
    });

    it("refuses the default secrets, wherever they are", async () => {
      for (const file of [
        "/.env",
        "/.env.local",
        "/server.key",
        "/.npmrc",
        "/.git/config",
        "/nested/.env.production",
      ]) {
        await request(origin).get(file).expect(403);
      }
    });

    it("refuses them under another case or an encoded name", async () => {
      await request(origin).get("/cert.PEM").expect(403);
      // An encoded dot is still a dot.
      // cspell:disable-next-line
      await request(origin).get("/%2Eenv").expect(403);
      await request(origin).get("/nested%2F.env.production").expect(403);
    });

    it("serves everything else", async () => {
      await request(origin).get("/index.txt").expect(200, "index.txt");
      await request(origin).get("/notes.md").expect(200);
    });

    it("leaves them out of the directory listing", async () => {
      const { text } = await request(origin).get("/listing/").expect(200);

      expect(text).toContain("readme.txt");
      expect(text).not.toContain("private.key");
    });
  });

  describe("patterns of your own", () => {
    let server;

    before(async () => {
      server = await serve({ deny: ["*.{md,txt}"] });
    });

    after(async () => {
      await server.stop();
    });

    it("refuses what they match, and only that", async () => {
      await request(origin).get("/notes.md").expect(403);
      await request(origin).get("/index.txt").expect(403);
      await request(origin).get("/server.key").expect(200);
    });
  });
});
