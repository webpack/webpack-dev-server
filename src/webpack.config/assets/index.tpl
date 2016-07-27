<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>{%= o.htmlWebpackPlugin.options.title %}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <!-- app.css -->
  <link rel="stylesheet" type="text/css" href="/app.css">
  <!-- server-worker.js -->
  <!-- manifest.json -->
  <script type="text/javascript">
  (function(){
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ',    registration.scope);
      }).catch(function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    }
  }())
  </script>
  <link rel="manifest" href="manifest.json">

  <!-- app & lib bootstrapping -->
  {%# o.htmlWebpackPlugin.options.polyfills.map(name =>
        `<script defer="${name}"></script>`) %}
  {%# o.htmlWebpackPlugin.options.chunks.map(name =>
        o.htmlWebpackPlugin.files.chunks[name])
      .reduce((a, o) =>
        a.concat([`<script defer src="/${o.entry}"></script>`]), []).reverse().join("\n") %}
</head>
<body>
  <!--[if lt IE 8]>
    <p class="browsehappy">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
  <![endif]-->
  <h1>Hello World</h1>
  <div id="app">
    <noscript>
    <h1>Please enable JavaScript.</h1>
    </noscript>
  </div>
</body
</html>
