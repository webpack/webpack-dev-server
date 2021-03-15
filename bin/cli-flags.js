'use strict';

module.exports = {
  devServer: [
    {
      name: 'host',
      configs: [
        {
          type: 'string',
        },
      ],
      description: 'The hostname/ip address the server will bind to.',
    },
    {
      name: 'port',
      configs: [
        {
          type: 'number',
        },
      ],
      description: 'The port server will listen to.',
    },
    {
      name: 'static',
      configs: [
        {
          type: 'string',
        },
        {
          type: 'boolean',
        },
      ],
      description: 'A directory to serve static content from.',
      multiple: true,
      negative: true,
    },
    {
      name: 'live-reload',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Enables live reloading on changing files.',
      negatedDescription: 'Disables live reloading on changing files.',
      negative: true,
    },
    {
      name: 'https',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Use HTTPS protocol.',
      negatedDescription: 'Do not use HTTPS protocol.',
      negative: true,
    },
    {
      name: 'http2',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Use HTTP/2, must be used with HTTPS.',
      negatedDescription: 'Do not use HTTP/2.',
      negative: true,
    },
    {
      name: 'bonjour',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Broadcasts the server via ZeroConf networking on start.',
    },
    {
      name: 'client-progress',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Print compilation progress in percentage in the browser.',
      processor(opts) {
        opts.client = opts.client || {};
        opts.client.progress = opts.clientProgress;
        delete opts.clientProgress;
      },
    },
    {
      name: 'setup-exit-signals',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Close and exit the process on SIGINT and SIGTERM.',
      negatedDescription:
        'Do not close and exit the process on SIGNIT and SIGTERM.',
      negative: true,
    },
    {
      name: 'stdin',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Close when stdin ends.',
    },
    {
      name: 'open',
      configs: [
        {
          type: 'boolean',
        },
        {
          type: 'string',
        },
      ],
      description:
        'Open the default browser, or optionally specify a browser name.',
    },
    {
      name: 'use-local-ip',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Open default browser with local IP.',
    },
    {
      name: 'open-page',
      configs: [
        {
          type: 'string',
        },
      ],
      description: 'Open default browser with the specified page.',
      multiple: true,
    },
    {
      name: 'client-logging',
      configs: [
        {
          type: 'string',
        },
      ],
      description:
        'Log level in the browser (none, error, warn, info, log, verbose).',
      processor(opts) {
        opts.client = opts.client || {};
        opts.client.logging = opts.clientLogging;
        delete opts.clientLogging;
      },
    },
    {
      name: 'history-api-fallback',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Fallback to /index.html for Single Page Applications.',
      negatedDescription:
        'Do not fallback to /index.html for Single Page Applications.',
      negative: true,
    },
    {
      name: 'compress',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'Enable gzip compression.',
      negatedDescription: 'Disable gzip compression.',
      negative: true,
    },
    {
      name: 'public',
      configs: [
        {
          type: 'boolean',
        },
      ],
      description: 'The public hostname/ip address of the server.',
    },
    {
      name: 'firewall',
      configs: [
        {
          type: 'boolean',
        },
        {
          type: 'string',
        },
      ],
      description:
        'Enable firewall or set hosts that are allowed to access the dev server.',
      negatedDescription: 'Disable firewall.',
      multiple: true,
      negative: true,
    },
  ],
};
