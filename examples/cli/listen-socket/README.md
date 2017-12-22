# CLI: Socket Option

To run the entire example, start the server with the following command:

```console
npm run webpack-dev-server -- --socket ./webpack.sock
```

And then start node server that will use that socket:

```console
node check-socket.js
```

## What Should Happen

You should see this responses to this command:

```console
Successfully connected to socket, exiting
```

## Use Cases

A common use-case for this feature is configuring upstream in nginx that points
to webpack socket. Listening to socket instead of port is much more convenient
because if you have many applications you don't have to resolve port conflicts
since each of them has own unique socket.

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

Replace `/webpack/` with your `publicPath` param value and path in `proxy_pass`
to your actual proxy location.
