# https

```shell
node ../../bin/webpack-dev-server.js --open --port 5000 --host 0.0.0.0
```

We want to change the port to `5000`, and make the server publicly accessible.

## What should happen

The script should open `http://0.0.0.0:5000/`. You should see "It's working."

Get your local ip (e.g. `192.168.1.40`), and try it from `192.168.1.40:5000`. Make sure your firewall doesn't block this port.
