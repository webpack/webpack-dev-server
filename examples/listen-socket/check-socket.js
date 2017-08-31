'use strict';

const net = require('net');

const client = net.createConnection('./webpack.sock');
client.on('connect', () => {
  console.log('Successfully connected to socket, exiting');
	process.exit(1); // eslint-disable-line
});
