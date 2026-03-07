"use strict";

// Helper function to check if server is ready using fetch
const waitForServer = async (port, timeout = 10000) => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      await fetch(`http://127.0.0.1:${port}/`);
      return; // Server is ready
    } catch {
      // Server not ready yet, wait and retry
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }
  }

  throw new Error(`Server on port ${port} not ready after ${timeout}ms`);
};

module.exports = (compiler, port = null) =>
  new Promise((resolve, reject) => {
    const watching = compiler.watch({}, async (error, stats) => {
      if (error) {
        watching.close();
        return reject(error);
      }

      // If a port is provided, wait for the server to be ready
      if (port) {
        try {
          await waitForServer(port);
        } catch (err) {
          watching.close();
          return reject(err);
        }
      }

      // Return both stats and watching for caller to manage
      resolve({ stats, watching });
    });
  });
