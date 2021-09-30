# Examples

Each example showcases a particular feature of `webpack-dev-server`. You can use
these examples to learn how to use certain features, or as a means to test features
when working on a Pull Request.

An example should be as minimal as possible and consists of at least:

- An `app.js` file - the entry point for an example app.
- A `README.md` file containing information about, and how to run the example app.
- A description of what should happen when running the example.
- A `webpack.config.js` file containing the `webpack` configuration for the example app.

## API

API examples can be found in the `api` directory. These examples demonstrate how
to access and run `webpack-dev-server` directly in your application / script.

## Notes

- Each example's `webpack` config is wrapped with `util.setup`; a helper function
  that adds plugins and configuration needed by each example to render in a consistent
  and visually pleasing way.
- Examples' `bundle.js` and `index.html` files are compiled and served from memory.
  You won't actually see these files written to disk, but if you examine the `webpack`
  output, you should see their file indicators.
