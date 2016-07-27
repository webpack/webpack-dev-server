//WebpackServiceWorker(' + params.data_var_name + ');\n      ' + source + '\n    ';
function WebpackServiceWorker(params) {
  var scopeURL = new URL(registration.scope);

  var strategy = params.strategy;
  var assets = params.assets;
  var tagMap = {
    all: params.version,
    // Hash is included in output file, but not used in cache name,
    // this allows updating only changed files in `additional` section and
    // always revalidation files of `main` section when hash changed
    changed: 'static',
    hash: params.hash
  };

  var CACHE_PREFIX = params.name;
  var CACHE_TAG = tagMap[strategy];
  var CACHE_NAME = CACHE_PREFIX + ':' + CACHE_TAG;

  if (params.relativePaths) {
    mapAssets();
  }

  var allAssets = [].concat(assets.main, assets.additional, assets.optional);

  self.addEventListener('install', function (event) {
    console.log('[SW]:', 'Install event');

    var installing = cacheAssets('main').then(cacheAdditional);
    event.waitUntil(installing);
  });

  self.addEventListener('activate', function (event) {
    console.log('[SW]:', 'Activate event');

    // Delete all assets which start with CACHE_PREFIX and
    // is not current cache (CACHE_NAME)
    var deletion = deleteObsolete();

    if (strategy === 'changed') {
      deletion = deletion.then(deleteChanged);
    }

    event.waitUntil(deletion.then(function () {
      if (self.clients && self.clients.claim) {
        return self.clients.claim();
      }
    }));
  });

  function cacheAdditional() {
    if (!assets.additional.length) return;

    if (DEBUG) {
      console.log('[SW]:', 'Caching additional');
    }

    if (strategy === 'changed') {
      cacheChanged();
    } else {
      cacheAssets('additional');
    }
  }

  function cacheAssets(section) {
    return caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(assets[section]).then(function () {
        console.groupCollapsed('[SW]:', 'Cached assets: ' + section);
        assets[section].forEach(function (asset) {
          console.log('Asset:', asset);
        });
        console.groupEnd();
      });
    });
  }

  function cacheChanged() {
    var cache = undefined;

    return caches.open(CACHE_NAME).then(function (_cache) {
      cache = _cache;
      return _cache.keys();
    }).then(function (keys) {
      var paths = keys.map(function (req) {
        return new URL(req.url).pathname;
      });

      var changed = assets.additional.filter(function (path) {
        return paths.indexOf(path) === -1;
      });

      if (!changed.length) return;

      console.group('[SW]:', 'Caching changed assets');
      changed.map(function (path) {
        console.log('Asset:', path);
        return new Request(path);
      }).map(function (req) {
        return fetch(req).then(function (res) {
          return cache.put(req, res);
        });
      });
      console.groupEnd();
    });
  }

  function deleteObsolete() {
    return caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        if (name === CACHE_NAME || name.indexOf(CACHE_PREFIX) !== 0) return;
        console.log('[SW]:', 'Delete cache:', name);
        return caches['delete'](name);
      }));
    });
  }

  function deleteCahnged() {
    var cache = undefined;

    return caches.open(CACHE_NAME).then(function (_cache) {
      cache = _cache;
      return _cache.keys();
    }).then(function (keys) {
      var deletion = keys.filter(function (req) {
        var url = new URL(req.url);

        if (allAssets.indexOf(url.pathname) === -1) {
          req._pathname = url.pathname;
        }
      });

      if (!deletion.length) return;

      console.group('[SW]:', 'Deleting changed assets');
      deletion = deletion.map(function (req) {
        console.log('Asset:', req._pathname);
        return cache['delete'](req);
      });
      console.groupEnd();

      return Promise.all(deletion);
    });
  }

  self.addEventListener('fetch', function (event) {
    var url = new URL(event.request.url);

    // Match only same origin and known caches
    // otherwise just perform fetch()
    if (event.request.method !== 'GET' || url.origin !== location.origin || allAssets.indexOf(url.pathname) === -1) {
      if (DEBUG) {
        console.log('[SW]:', 'Path [' + url.pathname + '] does not match any assets');
      }

      return;
    }

    // if asset is from main entry read it directly from the cache
    if (assets.main.indexOf(url.pathname) !== -1) {
      event.respondWith(caches.match(event.request, {
        cacheName: CACHE_NAME
      }));

      return;
    }

    var resource = caches.match(event.request, {
      cacheName: CACHE_NAME
    }).then(function (response) {
      if (response) {
        if (DEBUG) {
          console.log('[SW]:', 'Path [' + url.pathname + '] from cache');
        }

        return response;
      }

      // Load and cache known assets
      return fetch(event.request.clone()).then(function (response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          if (DEBUG) {
            console.log('[SW]:', 'Path [' + url.pathname + '] wrong response');
          }

          return response;
        }

        if (DEBUG) {
          console.log('[SW]:', 'Path [' + url.pathname + '] fetched');
        }

        var responseClone = response.clone();

        caches.open(CACHE_NAME).then(function (cache) {
          return cache.put(event.request, responseClone);
        }).then(function () {
          console.log('[SW]:', 'Cache asset: ' + url.pathname);
        });

        return response;
      });
    });

    event.respondWith(resource);
  });

  function mapAssets() {
    Object.keys(assets).forEach(function (key) {
      assets[key] = assets[key].map(function (path) {
        var pathURL = new URL(scopeURL.origin + scopeURL.pathname + path);
        return pathURL.pathname;
      });
    });
  }
}
