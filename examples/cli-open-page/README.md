# CLI - OPEN-PAGE

```shell
node ../../bin/webpack-dev-server.js --open-page example.html#page1
```

Some applications may consist of multiple web pages. During development it may be useful to directly open a particular page. The page to open may be specified as the argument to the `open-page` option. 

## What should happen

The script should open `http://localhost:8080/example.html#page1`. In the app you should see "It's working."
