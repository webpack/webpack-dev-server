# Host and Port Options

You may choose to wish to change the host and port on which `webpack-dev-server`
will run. The `host` and `port` options allow for that.

## host

### IPv4

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    host: "0.0.0.0",
    port: 5000,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --port 5000 --host 0.0.0.0
```

### IPv6

_This also works with IPv6_

**webpack.config.js**

```js
module.exports = {
  // ...
  devServer: {
    host: "::",
    port: 5000,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --port 5000 --host ::
```

### local-ip

Specifying `local-ip` as `host` will try to resolve the `host` option as your local `IPv4` address if available, if `IPv4` is not available it will try to resolve your local `IPv6` address.

```js
module.exports = {
  // ...
  devServer: {
    host: "local-ip",
    port: 5000,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --port 5000 --host local-ip
```

### local-ipv4

Specifying `local-ipv4` as `host` will try to resolve the `host` option as your local `IPv4` address.

```js
module.exports = {
  // ...
  devServer: {
    host: "local-ipv4",
    port: 5000,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --port 5000 --host local-ipv4
```

### local-ipv6

Specifying `local-ipv6` as `host` will try to resolve the `host` option as your local `IPv6` address.

```js
module.exports = {
  // ...
  devServer: {
    host: "local-ipv6",
    port: 5000,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --port 5000 --host local-ipv6
```

#### What Should Happen

1. The script should open `http://0.0.0.0:5000/` if specifying the IPv4 option,
   or `http://[::]:5000/` for IPv6, in your default browser.
2. You should see the text on the page itself change to read `Success!`.

## port

### specific port

Tell the server to connect to a specific port with the following:

```js
module.exports = {
  // ...
  devServer: {
    port: 9000,
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --port 9000
```

#### What Should Happen

1. The script should open `http://localhost:9000/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.

### auto

Specifying `auto` as `port` will try to connect the server to the default port `8080` and if not available it will automatically search for another free port.

```js
module.exports = {
  // ...
  devServer: {
    port: "auto",
  },
};
```

Usage via CLI:

```console
npx webpack serve --open --port auto
```

#### What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. Keep the server open and switch to a new terminal window.
4. Run the script once again.
5. The script should open `http://localhost:8081/` (or any other port if it is not free) in your default browser.
