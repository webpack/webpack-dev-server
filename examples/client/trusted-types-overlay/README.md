# client.overlay.trustedTypesPolicyName option

**webpack.config.js**

```js
module.exports = {
  // ...
  output: {
    trustedTypes: { policyName: "webpack" },
  },
  devServer: {
    client: {
      overlay: {
        trustedTypesPolicyName: "overlay-policy",
      },
    },
  },
};
```

Usage via CLI:

```shell
npx webpack serve --open
```

## What Should Happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see an overlay in browser for compilation errors.
3. Modify `devServer.client.overlay.trustedTypesPolicyName` in webpack.config.js to `disallowed-policy` and save.
4. Restart the command and you should not see an overlay at all. In the console you should see the following error:

```
Refused to create a TrustedTypePolicy named 'disallowed-policy' because it violates the following Content Security Policy directive: "trusted-types webpack overlay-policy".
```
