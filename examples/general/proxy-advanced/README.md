# General: Proxy Advanced

This example demonstrates a user case whereby the app proxies all urls that start with `/api` to
`http://jsonplaceholder.typicode.com/`, but removes `/api` from the url. So
`http://localhost:8080/api/users` should perform a request to
`http://jsonplaceholder.typicode.com/users`.

```console
npx webpack serve --open
```

## What should happen

1. The script should open `http://localhost:8080/` in your default browser.
2. You should see the text on the page itself change to read `Success!`.
3. Navigate to `http://localhost:8080/api/users`.
4. The page should display several JSON objects.
5. Navigate to `http://localhost:8080/api/nope`.
6. The page should display `Bypassed proxy!``.
