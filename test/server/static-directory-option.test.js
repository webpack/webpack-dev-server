"use strict";

const path = require("path");
const fs = require("graceful-fs");
const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const testServer = require("../helpers/test-server");
const config = require("../fixtures/contentbase-config/webpack.config");
const port = require("../ports-map")["static-directory-option"];

const staticDirectory = path.resolve(
  __dirname,
  "../fixtures/contentbase-config"
);
const publicDirectory = path.resolve(staticDirectory, "public");
const otherPublicDirectory = path.resolve(staticDirectory, "other");

describe("static.directory option", () => {
  let server;
  let req;

  describe("to directory", () => {
    const nestedFile = path.resolve(publicDirectory, "assets/example.txt");

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            watch: true,
          },
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });

      fs.truncateSync(nestedFile);
    });

    it("Request to index", async () => {
      const response = await req.get("/");

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain("Heyo");
    });

    it("Request to other file", async () => {
      const response = await req.get("/other.html");

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain("Other html");
    });

    it("Watches folder recursively", (done) => {
      // chokidar emitted a change,
      // meaning it watched the file correctly
      server.staticWatchers[0].on("change", () => {
        done();
      });

      // change a file manually
      setTimeout(() => {
        fs.writeFileSync(nestedFile, "Heyo", "utf8");
      }, 1000);
    });

    it("watch node_modules", (done) => {
      const filePath = path.join(publicDirectory, "node_modules", "index.html");

      fs.writeFileSync(filePath, "foo", "utf8");

      // chokidar emitted a change,
      // meaning it watched the file correctly
      server.staticWatchers[0].on("change", () => {
        fs.unlinkSync(filePath);

        done();
      });

      // change a file manually
      setTimeout(() => {
        fs.writeFileSync(filePath, "bar", "utf8");
      }, 1000);
    });
  });

  describe("test listing files in folders without index.html using the option static.serveIndex:false", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            watch: true,
            serveIndex: false,
          },
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("shouldn't list the files inside the assets folder (404)", async () => {
      const response = await req.get("/assets/");

      expect(response.statusCode).toEqual(404);
    });

    it("should show Heyo. because bar has index.html inside it (200)", async () => {
      const response = await req.get("/bar/");

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain("Heyo");
    });
  });

  describe("test listing files in folders without index.html using the option static.serveIndex:true", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            watch: true,
            serveIndex: true,
          },
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("should list the files inside the assets folder (200)", async () => {
      const response = await req.get("/assets/");

      expect(response.statusCode).toEqual(200);
    });

    it("should show Heyo. because bar has index.html inside it (200)", async () => {
      const response = await req.get("/bar/");

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain("Heyo");
    });
  });

  describe("test listing files in folders without index.html using the option static.serveIndex default (true)", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: {
            directory: publicDirectory,
            watch: true,
          },
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("should list the files inside the assets folder (200)", async () => {
      const response = await req.get("/assets/");

      expect(response.statusCode).toEqual(200);
    });

    it("should show Heyo. because bar has index.html inside it (200)", async () => {
      const response = await req.get("/bar/");

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain("Heyo");
    });
  });

  describe("to directories", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: [publicDirectory, otherPublicDirectory],
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("Request to first directory", async () => {
      const response = await req.get("/");

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain("Heyo");
    });

    it("Request to second directory", async () => {
      const response = await req.get("/foo.html");

      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain("Foo!");
    });
  });

  describe("testing single & multiple external paths", () => {
    afterEach((done) => {
      testServer.close(() => {
        done();
      });
    });

    it("Should throw exception (external url)", (done) => {
      expect.assertions(1);

      // eslint-disable-next-line no-unused-vars
      server = testServer.start(
        config,
        {
          static: "https://example.com/",
        },
        (error) => {
          expect(error.message).toBe(
            "Using a URL as static.directory is not supported"
          );

          server.close(done);
        }
      );
    });

    it("Should not throw exception (local path with lower case first character)", (done) => {
      testServer.start(
        config,
        {
          static: {
            directory:
              publicDirectory.charAt(0).toLowerCase() +
              publicDirectory.substring(1),
            watch: true,
          },
          port,
        },
        done
      );
    });

    it("Should not throw exception (local path with lower case first character & has '-')", (done) => {
      testServer.start(
        config,
        {
          static: {
            directory: "c:\\absolute\\path\\to\\content-base",
            watch: true,
          },
          port,
        },
        done
      );
    });

    it("Should not throw exception (local path with upper case first character & has '-')", (done) => {
      testServer.start(
        config,
        {
          static: {
            directory: "C:\\absolute\\path\\to\\content-base",
            watch: true,
          },
          port,
        },
        done
      );
    });

    it("Should throw exception (array with absolute url)", (done) => {
      // eslint-disable-next-line no-unused-vars
      server = testServer.start(
        config,
        {
          static: [publicDirectory, "https://example.com/"],
        },
        (error) => {
          expect(error.message).toBe(
            "Using a URL as static.directory is not supported"
          );

          server.close(done);
        }
      );
    });
  });

  describe("default to PWD", () => {
    beforeAll(async () => {
      jest
        .spyOn(process, "cwd")
        .mockImplementation(() => path.resolve(staticDirectory));

      const compiler = webpack(config);

      server = new Server(
        {
          // eslint-disable-next-line no-undefined
          static: undefined,
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("Request to page", async () => {
      const response = await req.get("/index.html");

      expect(response.statusCode).toEqual(200);
    });
  });

  describe("disable", () => {
    beforeAll(async () => {
      // This is a somewhat weird test, but it is important that we mock
      // the PWD here, and test if /other.html in our "fake" PWD really is not requested.
      jest.spyOn(process, "cwd").mockImplementation(() => publicDirectory);

      const compiler = webpack(config);

      server = new Server(
        {
          static: false,
          port,
        },
        compiler
      );

      await new Promise((resolve, reject) => {
        server.listen(port, "127.0.0.1", (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("Request to page", async () => {
      const response = await req.get("/other.html");

      expect(response.statusCode).toBe(404);
    });
  });
});
