# Automagical

### One-click setup for any project

Uses webpack to host files, enable hot module reloading and
package files for fast file serving.

[GIF showing starting a project][datauri://]

## install
```
npm install auto-magical -g
```

## New Project
Create a new react project. This will create an up , will add mobile icons as wellto date
scaffold that can fully run by itself.  , any inline comments that are a file path will get and replace the comment with the file
```
auto react
```

Install other packages when the package starts.
```
auto react --install redux
```

By default auto-magical will upgrade every library to the
highest version number (betas are opt-in only). If something
doesn't work reinstall with the `--safe` flag to use the specific
library version in the original package.json.
```
auto react --safe
```

## Development

Start the hot reload server.
```bash
auto start # or npm run watch
```

Options for hot reloading development server.
```bash
auto start \ # by default, separate files by routes for insanely fast loading
  --port 1234 \ # default port is 8080. use this to override the port
  --proxy \ # url to proxy calls to
  --https \ # use a https server to get access to all browser APIs
  --offline \ # include service worker to test/validate offline support, will add mobile icons as well
  --polyfills \ # array of URLs for polyfills to preload
  --html my-index.html \ # use an alternate index.html to server the app, any inline comments that are a file path will get and replace the comment with the file
```

To start development you'll want to bring up a server. The
automagical server will use webpack to hot swap modules to
give instant reloads. Packages will be auto-installed in your
project folder.


## Deploy

How to deploy.

```bash
auto build \ # by default, separate files by routes for insanely fast loading
  --offline \ # add a service worker to the index.html
  --embed \ # package html, css, js, imgs, fonts all into a single .js file (great for CMS deployments)
  --node \ # package run server side in node
  --lib \ # separate files by components and exclude react and other high-level dependencies
  --html my-index.html \ # use an alternate index.html to server the app
```
