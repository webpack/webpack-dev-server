# CLI: Host and Port Options

You may choose to wish to change the host and port on which `webpack-dev-server`
will run. The `host` and `port` options allow for that.

## IPv4

```console
npm run webpack-dev-server -- --open-target --port 5000 --host 0.0.0.0
```

## IPv6

_This also works with IPv6_

```console
npm run webpack-dev-server -- --open-target --port 5000 --host ::
```

## local-ip

Specifying `local-ip` as `host` will try to resolve the `host` option as your local `IPv4` address if available, if `IPv4` is not available it will try to resolve your local `IPv6` address.

```console
npm run webpack-dev-server -- --open-target --port 5000 --host local-ip
```

## local-ipv4

Specifying `local-ipv4` as `host` will try to resolve the `host` option as your local `IPv4` address.

```console
npm run webpack-dev-server -- --open-target --port 5000 --host local-ipv4
```

## local-ipv6

Specifying `local-ipv6` as `host` will try to resolve the `host` option as your local `IPv6` address.

```console
npm run webpack-dev-server -- --open-target --port 5000 --host local-ipv6
```

## What Should Happen

1. The script should open `http://0.0.0.0:5000/` if specifying the IPv4 option,
   or `http://[::]:5000/` for IPv6, in your default browser.
2. You should see the text on the page itself change to read `Success!`.
