# Bonjour (ZeroConf)

The Bonjour capability broadcasts server information via ZeroConf when the Server
is started.

## boolean

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    bonjour: true,
  },
};
```

Usage via CLI:

```console
npx webpack serve --bonjour
```

## What Should Happen

A Zeroconf broadcast should occur, containing data with a type of `http` and a
subtype of `webpack`.
