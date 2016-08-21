# 1.15.0 (unreleased)

- Use http-proxy-middleware instead of http-proxy. This fixes compatibility with native web sockets (#359).
- Properly close the server, which fixes issues with the port not freeing up (#357).
- Add `--stdin` flag, to close the dev server on process exit (#352).
- Fix issues with incorrect socket urls (#338, #443, #447).
- Add `--open` flag to open a browser pointing to the server (#329).
- Add `--public` flag to override the url used for connecting to the web socket (#368).
- Allow array for `options.contentBase`, so multiple sources are allowed (#374).
- Add `options.staticOptions` to allow passing through Express static options (#385).
- Update self-signed certs (#436).
- Don't reload the app upon proxy errors (#478).
- Allow running dev-server behind https proxy (#470).
- Set headers on all requests to support e.g. CORS (#499).
- Fix `--cacert` flag not doing anything (#532).
- Allow using Express middleware (#537).
