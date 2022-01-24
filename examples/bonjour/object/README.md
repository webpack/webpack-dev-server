# Bonjour (ZeroConf)

The Bonjour capability broadcasts server information via ZeroConf when the Server
is started.

## Bonjour options

Allows options from bonjour for more [configuration](https://github.com/watson/bonjour#initializing):

```js
// webpack.config.js
module.exports = {
  // ...
  devServer: {
    bonjour: {
      name: "webpack-dev-server",
      type: "https",
      subtype: "webpack",
    },
  },
};
```

```console
npx webpack serve --config webpack.config.js
```

## What Should Happen

A Zeroconf broadcast should occur, containing data with a type of `https` and a
subtype of `webpack`.
