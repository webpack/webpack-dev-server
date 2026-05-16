const waitForServer = async (port, timeout = 10000) => {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      await fetch(`http://127.0.0.1:${port}/`);
      return;
    } catch {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }
  }

  throw new Error(`Server on port ${port} not ready after ${timeout}ms`);
};

export default (compiler, port = null) =>
  new Promise((resolve, reject) => {
    const watching = compiler.watch({}, async (error, stats) => {
      if (error) {
        watching.close();
        return reject(error);
      }

      if (port) {
        try {
          await waitForServer(port);
        } catch (err) {
          watching.close();
          return reject(err);
        }
      }

      resolve({ stats, watching });
    });
  });
