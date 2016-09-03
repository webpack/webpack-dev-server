# Compression

```shell
node ../../bin/webpack-dev-server.js --open --compress
```

Gzip compression is enabled. 

## What should happen

The script should open `https://localhost:8080/`.

Open the devtools -> `Network` tab, and find `bundle.js`. The response headers should have a `Content-Encoding: gzip` header.
