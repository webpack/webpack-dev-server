# CLI - public protocol

NOTE: make sure you have docker and docker-compose (at least version 2) installed and already installed all dependencies via `npm install` in the repository.

```shell
docker-compose up
```

If you're manually injecting an entrypoint to an iframe, the client needs to know where to connect to the server. Since an iframe with `src="about:blank` doesn't know which protocol you're using on the outside we need to explicitly define it with the `public` option (have a look to the config provided in `webpack.config.js`).

To be able to show how this works together with an nginx reverse proxy there's a small docker setup which does this for you.

## What should happen

The `docker-compose up` starts up two containers (nginx and devserver), whereas nginx is exposing port 80 and 443 (with a self-signed certificate). If you open your browser and navigate to `https://localhost` you have to accept the self-signed certificate which is - of course - not secure but ok for testing purposes. After that you can see an iframe which says `I'm sitting in the iframe and the socket connection to dev-server works!`. 

If you have a look at the network tab of the inspector you'll see that the `sockjs-node` connection is up and running. If you wouldn't specify the `https://` protocol in the `public` option, it would try to connect to the socket via `http://localhost` which would fail because the parent window is loaded via `https` and therefore violate the security rules of the browser. 

If you edit the contents of `app.js` you'll also see that auto-reloading works.
