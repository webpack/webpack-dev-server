# CLI: Open Target Option

Open default generated URL in browser:

```
npx webpack serve --open-target <url>
```

Open specific page in browser:

```
npx webpack serve --open-target /example.html#page1
```

Open specific browser:

```
npx webpack serve --open-app firefox
```

Open specific page in specific browser:

```
npx webpack serve --open-target example.html#page1 --open-app firefox
```

Some applications may consist of multiple pages. During development it may
be useful to directly open a particular page. The page to open may be specified
as the argument to the `open-target` option.

## What Should Happen

The script should open `http://localhost:8080/example.html#page1` in your
default/specified browser. You should see the text on the page itself change to read `Success!`.
