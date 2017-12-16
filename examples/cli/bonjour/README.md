# Bonjour (ZeroConf)

The Bonjour capability broadcasts server information via ZeroConf when the Server
is started.

To run this example, run this command in your console or terminal:

```console
npm run webpack-dev-server -- --bonjour
```

## What Should Happen

A Zeroconf broadcast should occur, containing data with a type of `http` and a
subtype of `webpack`.
