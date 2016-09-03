# Proxy: advanced

```shell
node ../../bin/webpack-dev-server.js --open
```

We want to proxy all urls that start with `/api` to `http://jsonplaceholder.typicode.com/`, but remove `/api` from the url. So `http://localhost:8080/api/users` should do a request to `http://jsonplaceholder.typicode.com/users`.

## What should happen

The script should open `http://localhost:8080/`. It should show "It's working."

Go to `http://localhost:8080/api/users`. It should show a couple of JSON objects.

Go to `http://localhost:8080/api/nope`. It should show the "Bypassed proxy!".
