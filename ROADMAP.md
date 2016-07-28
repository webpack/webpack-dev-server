## Purpose

Using Hot Module Reloading front-end javascript code should
be easier than running nodemon.

## Implementation

* use Webpack 2 & Webpack-dev-server installed in npm global
to run app
* The user's project shouldn't contain any modules to run
the dev environment. It can simply have scripts to build
and deploy the project. It should be 100% optional
and not done on a per-project biases.
* It include build targets for high-speed deploy via chunking,
dev mode with HMR, embed to combine everything into a single file
for hosting on CMSs or other limited deployment environments.
* Allow for a project's webpack config to override that
default HMR server config.

## Internal dev setup
Create global symlink to the project
```
ln -s /usr/local/bin/auto </path/to/source>/automagical/bin/auto.js
```

run the project
```
cd </path/to/react/project>
auto
```

## TODOs

- fork webpack-dev-server
- refactor old webpack.config into sane structure
- config, create index template to server project
- config, add minify settings
- config, add production and development settings
- config, add hmr
- config, expose command line options for simple tweaks
X config, add offline via service worker
X config, add server-side rendering
X config, add hybrid, joint server-side & client-side renderings
X config, allow for user projects to override defaults with
their own webpack.config file
X validate global install works
