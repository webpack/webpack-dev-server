# CLI: Web Socket URL

```console
npx webpack serve --open --host 0.0.0.0 --client-web-socket-url ws://<insert-host>:8080
```

_NOTE: replace `<insert-host>` with your local IP Address._

In order to make the server publicly accessible the client needs to know with
what host to connect to the server. If `--host 0.0.0.0` is given, the client
would try to connect to `0.0.0.0`. With the `--client-web-socket-url` options it is possible to
override this.

## What Should Happen

1. The script should open `http://0.0.0.0:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. Open the console in your browser's devtools.
4. Select the 'Network' tab.
5. Select the 'WS' or 'WebSockets' sub-tab.
6. Verify that the WebSocket is connecting to `<insert-host>:8080`.
