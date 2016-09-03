# CLI - public

NOTE: replace `<insert local ip>` with your local ip.

```shell
node ../../bin/webpack-dev-server.js --open --host 0.0.0.0 --public <insert local ip>:8080
```

If you want to make the client publicly accessible, the client needs to know with what host to connect to the server. If `--host 0.0.0.0` is given, the client would try to connect to `0.0.0.0`. With `--public` it is possible to override this.

## What should happen

The script should open `http://0.0.0.0:8080/`. In the app you should see "It's working."

Verify that the websocket is connecting to `<insert local ip>:8080`. Go to devtools -> Network, click on "websocket" and check "Request URL".
