# https

```shell
node ../../bin/webpack-dev-server.js --open --https
```

A fake certificate is used to enable https.

## What should happen

The script should open `https://localhost:8080/`. Your browser will probably give you a warning about using an invalid certificate. After ignoring this warning, you should see "It's working."
