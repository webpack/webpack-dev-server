# Gzip Compression

Website gzip compression makes it possible to reduce the file size of a file
to roughly 30% of its original size before the files are sent to the browser.

To run this example, run this command in your console or terminal:

```console
npm run webpack-dev-server -- --open --compress
```

## What should happen

1. The script should open `https://localhost:8080/`.
2. Files being sent to the browser from the `webpack` bundle should be gzipped.
3. Open the console in your browser's devtools and select the _Network_ tab.
4. Find `bundle.js`. The response headers should contain `Content-Encoding: gzip`.

## Notes

Some browsers, such as Chrome, won't show the `Content-Encoding: gzip` within
the _Response Headers_. This has been documented [here](https://github.com/expressjs/compression/issues/96).

To enable `Content-Encoding` for _Response Headers_ in Chrome, you can follow
[this tutorial](https://www.youtube.com/watch?v=47R6uv0RKCk).
