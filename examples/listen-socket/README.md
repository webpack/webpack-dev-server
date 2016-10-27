# Listen to socket

Start dev server in socket mode:

```shell
node ../../bin/webpack-dev-server.js --socket ./webpack.sock
```

And then start node server that will use that socket:

```shell
node check-socket.js
```

You should see this responses to this command:

```shell
Successfully connected to socket, exiting
```

Common use-case for this feature is configuring upstream in nginx that points to webpack socket.
Listening to socket instead of port is much more convenient because if you have many applications you don't have to resolve port conflicts since each of them has own unique socket.

Example of configuring upstream with Websockets support in nginx:

```
location /webpack/ {
	proxy_pass http://unix:/home/happywebpackuser/apps/todo/webpack.sock;
	proxy_set_header Host $host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_pass http://unix:/home/resure/code/statface-raw/app/run/statbox.sock;
	proxy_redirect off;
}
location /sockjs-node/ {
	proxy_pass http://unix:/home/happywebpackuser/apps/todo/webpack.sock;
	proxy_http_version 1.1;
	proxy_set_header Upgrade $http_upgrade;
	proxy_set_header Connection "upgrade";
}
```

Replace `/webpack/` with your `publicPath` param value and path in `proxy_pass` to your actual proxy location.
