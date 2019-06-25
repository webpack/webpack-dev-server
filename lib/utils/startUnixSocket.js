'use strict';

const fs = require('fs');
const net = require('net');

// userCallback should always be called to indicate that either the server has
// started listening, or an error was thrown.
// setupAndListenCallback should only be called if the server starts listening
function startUnixSocket(
  listeningApp,
  socket,
  setupAndListenCallback,
  userCallback
) {
  const fullCallback = (err) => {
    setupAndListenCallback();
    userCallback(err);
  };

  const chmodSocket = (done) => {
    // chmod 666 (rw rw rw) - octal
    const READ_WRITE = 438;
    fs.chmod(socket, READ_WRITE, done);
  };

  const startSocket = () => {
    listeningApp.on('error', (err) => {
      userCallback(err);
    });

    // 511 is the default value for the server.listen backlog parameter
    // https://nodejs.org/api/net.html#net_server_listen
    listeningApp.listen(socket, 511, (err) => {
      if (err) {
        fullCallback(err);
      } else {
        chmodSocket(fullCallback);
      }
    });
  };

  fs.access(socket, fs.constants.F_OK, (e) => {
    if (e) {
      // file does not exist
      startSocket();
    } else {
      // file exists

      const clientSocket = new net.Socket();

      clientSocket.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTSOCK') {
          // No other server listening on this socket so it can be safely removed
          fs.unlinkSync(socket);

          startSocket();
        }
      });

      clientSocket.connect({ path: socket }, () => {
        // if a client socket successfully connects to the given socket path,
        // it means that the socket is in use
        const err = new Error('This socket is already used');
        clientSocket.destroy();
        // do not call onListening or the setup method, since the server
        // cannot start listening on a used socket
        userCallback(err);
      });
    }
  });
}

module.exports = startUnixSocket;
