# https

```shell
node ../../bin/webpack-dev-server.js --open --https
```

A fake certificate is used to enable https.

You can provide the following SSL options to override the fake certificate:

* Certificate options e.g. `node ../../bin/webpack-dev-server.js --open --https --cacert=../../ssl/ca.pem --cert=../../ssl/server.crt --key=../../ssl/server.key`
* PFX and Passphrase e.g. `node ../../bin/webpack-dev-server.js --open --https --pfx=./test_cert.pfx --pfx-passphrase=sample`

## What should happen

The script should open `https://localhost:8080/`. Your browser will probably give you a warning about using an invalid certificate. After ignoring this warning, you should see "It's working."
