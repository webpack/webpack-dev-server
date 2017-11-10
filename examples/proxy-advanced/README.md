# Proxy: advanced

```shell
npm run webpack-dev-server -- --open
```

We want to proxy all urls that start with `/api` to `http://jsonplaceholder.typicode.com/`, but remove `/api` from the url. So `http://localhost:8080/api/users` should do a request to `http://jsonplaceholder.typicode.com/users`.

## What should happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.


Go to `http://localhost:8080/api/users`. It should show a couple of JSON objects.

Go to `http://localhost:8080/api/nope`. It should show the "Bypassed proxy!".
