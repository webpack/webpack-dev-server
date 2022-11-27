/// <reference types="node" />
export = Server;
declare class Server {
  static get schema(): {
    title: string;
    type: string;
    definitions: {
      AllowedHosts: {
        anyOf: (
          | {
              type: string;
              minItems: number;
              items: {
                $ref: string;
              };
              enum?: undefined;
              $ref?: undefined;
            }
          | {
              enum: string[];
              type?: undefined;
              minItems?: undefined;
              items?: undefined;
              $ref?: undefined;
            }
          | {
              $ref: string;
              type?: undefined;
              minItems?: undefined;
              items?: undefined;
              enum?: undefined;
            }
        )[];
        description: string /** @typedef {import("webpack").Configuration} WebpackConfiguration */;
        link: string;
      };
      AllowedHostsItem: {
        type: string;
        minLength: number;
      };
      Bonjour: {
        anyOf: (
          | {
              type: string;
              cli: {
                negatedDescription: string;
              } /** @typedef {import("express").Request} Request */;
              description?: undefined;
              link?: undefined;
            }
          | {
              type: string;
              description: string;
              link: string;
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
        description: string;
        link: string;
      };
      Client: {
        description: string;
        link: string;
        anyOf: (
          | {
              enum: boolean[];
              cli: {
                negatedDescription: string;
              };
              type?: undefined;
              additionalProperties?: undefined;
              properties?: undefined;
            }
          | {
              type: string;
              additionalProperties: boolean;
              properties: {
                logging: {
                  $ref: string;
                };
                /** @typedef {import("serve-static").ServeStaticOptions} ServeStaticOptions */
                /** @typedef {import("ipaddr.js").IPv4} IPv4 */
                /** @typedef {import("ipaddr.js").IPv6} IPv6 */
                /** @typedef {import("net").Socket} Socket */
                /** @typedef {import("http").IncomingMessage} IncomingMessage */
                /** @typedef {import("open").Options} OpenOptions */
                /** @typedef {import("https").ServerOptions & { spdy?: { plain?: boolean | undefined, ssl?: boolean | undefined, 'x-forwarded-for'?: string | undefined, protocol?: string | undefined, protocols?: string[] | undefined }}} ServerOptions */
                /**
                 * @template Request, Response
                 * @typedef {import("webpack-dev-middleware").Options<Request, Response>} DevMiddlewareOptions
                 */
                /**
                 * @template Request, Response
                 * @typedef {import("webpack-dev-middleware").Context<Request, Response>} DevMiddlewareContext
                 */
                /**
                 * @typedef {"local-ip" | "local-ipv4" | "local-ipv6" | string} Host
                 */
                /**
                 * @typedef {number | string | "auto"} Port
                 */
                /**
                 * @typedef {Object} WatchFiles
                 * @property {string | string[]} paths
                 * @property {WatchOptions & { aggregateTimeout?: number, ignored?: WatchOptions["ignored"], poll?: number | boolean }} [options]
                 */
                /**
                 * @typedef {Object} Static
                 * @property {string} [directory]
                 * @property {string | string[]} [publicPath]
                 * @property {boolean | ServeIndexOptions} [serveIndex]
                 * @property {ServeStaticOptions} [staticOptions]
                 * @property {boolean | WatchOptions & { aggregateTimeout?: number, ignored?: WatchOptions["ignored"], poll?: number | boolean }} [watch]
                 */
                /**
                 * @typedef {Object} NormalizedStatic
                 * @property {string} directory
                 * @property {string[]} publicPath
                 * @property {false | ServeIndexOptions} serveIndex
                 * @property {ServeStaticOptions} staticOptions
                 * @property {false | WatchOptions} watch
                 */
                /**
                 * @typedef {Object} ServerConfiguration
                 * @property {"http" | "https" | "spdy" | string} [type]
                 * @property {ServerOptions} [options]
                 */
                /**
                 * @typedef {Object} WebSocketServerConfiguration
                 * @property {"sockjs" | "ws" | string | Function} [type]
                 * @property {Record<string, any>} [options]
                 */
                /**
                 * @typedef {(import("ws").WebSocket | import("sockjs").Connection & { send: import("ws").WebSocket["send"], terminate: import("ws").WebSocket["terminate"], ping: import("ws").WebSocket["ping"] }) & { isAlive?: boolean }} ClientConnection
                 */
                /**
                 * @typedef {import("ws").WebSocketServer | import("sockjs").Server & { close: import("ws").WebSocketServer["close"] }} WebSocketServer
                 */
                /**
                 * @typedef {{ implementation: WebSocketServer, clients: ClientConnection[] }} WebSocketServerImplementation
                 */
                /**
                 * @callback ByPass
                 * @param {Request} req
                 * @param {Response} res
                 * @param {ProxyConfigArrayItem} proxyConfig
                 */
                /**
                 * @typedef {{ path?: HttpProxyMiddlewareOptionsFilter | undefined, context?: HttpProxyMiddlewareOptionsFilter | undefined } & { bypass?: ByPass } & HttpProxyMiddlewareOptions } ProxyConfigArrayItem
                 */
                /**
                 * @typedef {(ProxyConfigArrayItem | ((req?: Request | undefined, res?: Response | undefined, next?: NextFunction | undefined) => ProxyConfigArrayItem))[]} ProxyConfigArray
                 */
                /**
                 * @typedef {{ [url: string]: string | ProxyConfigArrayItem }} ProxyConfigMap
                 */
                /**
                 * @typedef {Object} OpenApp
                 * @property {string} [name]
                 * @property {string[]} [arguments]
                 */
                /**
                 * @typedef {Object} Open
                 * @property {string | string[] | OpenApp} [app]
                 * @property {string | string[]} [target]
                 */
                /**
                 * @typedef {Object} NormalizedOpen
                 * @property {string} target
                 * @property {import("open").Options} options
                 */
                /**
                 * @typedef {Object} WebSocketURL
                 * @property {string} [hostname]
                 * @property {string} [password]
                 * @property {string} [pathname]
                 * @property {number | string} [port]
                 * @property {string} [protocol]
                 * @property {string} [username]
                 */
                /**
                 * @typedef {Object} ClientConfiguration
                 * @property {"log" | "info" | "warn" | "error" | "none" | "verbose"} [logging]
                 * @property {boolean  | { warnings?: boolean, errors?: boolean }} [overlay]
                 * @property {boolean} [progress]
                 * @property {boolean | number} [reconnect]
                 * @property {"ws" | "sockjs" | string} [webSocketTransport]
                 * @property {string | WebSocketURL} [webSocketURL]
                 */
                /**
                 * @typedef {Array<{ key: string; value: string }> | Record<string, string | string[]>} Headers
                 */
                /**
                 * @typedef {{ name?: string, path?: string, middleware: ExpressRequestHandler | ExpressErrorRequestHandler } | ExpressRequestHandler | ExpressErrorRequestHandler} Middleware
                 */
                /**
                 * @typedef {Object} Configuration
                 * @property {boolean | string} [ipc]
                 * @property {Host} [host]
                 * @property {Port} [port]
                 * @property {boolean | "only"} [hot]
                 * @property {boolean} [liveReload]
                 * @property {DevMiddlewareOptions<Request, Response>} [devMiddleware]
                 * @property {boolean} [compress]
                 * @property {boolean} [magicHtml]
                 * @property {"auto" | "all" | string | string[]} [allowedHosts]
                 * @property {boolean | ConnectHistoryApiFallbackOptions} [historyApiFallback]
                 * @property {boolean} [setupExitSignals]
                 * @property {boolean | Record<string, never> | BonjourOptions} [bonjour]
                 * @property {string | string[] | WatchFiles | Array<string | WatchFiles>} [watchFiles]
                 * @property {boolean | string | Static | Array<string | Static>} [static]
                 * @property {boolean | ServerOptions} [https]
                 * @property {boolean} [http2]
                 * @property {"http" | "https" | "spdy" | string | ServerConfiguration} [server]
                 * @property {boolean | "sockjs" | "ws" | string | WebSocketServerConfiguration} [webSocketServer]
                 * @property {ProxyConfigMap | ProxyConfigArrayItem | ProxyConfigArray} [proxy]
                 * @property {boolean | string | Open | Array<string | Open>} [open]
                 * @property {boolean} [setupExitSignals]
                 * @property {boolean | ClientConfiguration} [client]
                 * @property {Headers | ((req: Request, res: Response, context: DevMiddlewareContext<Request, Response>) => Headers)} [headers]
                 * @property {(devServer: Server) => void} [onAfterSetupMiddleware]
                 * @property {(devServer: Server) => void} [onBeforeSetupMiddleware]
                 * @property {(devServer: Server) => void} [onListening]
                 * @property {(middlewares: Middleware[], devServer: Server) => Middleware[]} [setupMiddlewares]
                 */
                overlay: {
                  $ref: string;
                };
                progress: {
                  $ref: string;
                };
                reconnect: {
                  $ref: string;
                };
                webSocketTransport: {
                  $ref: string;
                };
                webSocketURL: {
                  $ref: string;
                };
              };
              enum?: undefined;
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
      };
      ClientLogging: {
        enum: string[];
        description: string;
        link: string;
      };
      ClientOverlay: {
        anyOf: (
          | {
              description: string;
              link: string;
              type: string;
              cli: {
                negatedDescription: string;
              };
              additionalProperties?: undefined;
              properties?: undefined;
            }
          | {
              type: string;
              additionalProperties: boolean;
              properties: {
                errors: {
                  description: string;
                  type: string;
                  cli: {
                    negatedDescription: string;
                  };
                };
                warnings: {
                  description: string;
                  type: string;
                  cli: {
                    negatedDescription: string;
                  };
                };
                trustedTypesPolicyName: {
                  description: string;
                  type: string;
                };
              };
              description?: undefined;
              link?: undefined;
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
      };
      ClientProgress: {
        description: string;
        link: string;
        type: string;
        cli: {
          negatedDescription: string;
        };
      };
      ClientReconnect: {
        description: string;
        link: string;
        anyOf: (
          | {
              /**
               * @typedef {{ path?: HttpProxyMiddlewareOptionsFilter | undefined, context?: HttpProxyMiddlewareOptionsFilter | undefined } & { bypass?: ByPass } & HttpProxyMiddlewareOptions } ProxyConfigArrayItem
               */
              /**
               * @typedef {(ProxyConfigArrayItem | ((req?: Request | undefined, res?: Response | undefined, next?: NextFunction | undefined) => ProxyConfigArrayItem))[]} ProxyConfigArray
               */
              /**
               * @typedef {{ [url: string]: string | ProxyConfigArrayItem }} ProxyConfigMap
               */
              /**
               * @typedef {Object} OpenApp
               * @property {string} [name]
               * @property {string[]} [arguments]
               */
              /**
               * @typedef {Object} Open
               * @property {string | string[] | OpenApp} [app]
               * @property {string | string[]} [target]
               */
              /**
               * @typedef {Object} NormalizedOpen
               * @property {string} target
               * @property {import("open").Options} options
               */
              /**
               * @typedef {Object} WebSocketURL
               * @property {string} [hostname]
               * @property {string} [password]
               * @property {string} [pathname]
               * @property {number | string} [port]
               * @property {string} [protocol]
               * @property {string} [username]
               */
              /**
               * @typedef {Object} ClientConfiguration
               * @property {"log" | "info" | "warn" | "error" | "none" | "verbose"} [logging]
               * @property {boolean  | { warnings?: boolean, errors?: boolean }} [overlay]
               * @property {boolean} [progress]
               * @property {boolean | number} [reconnect]
               * @property {"ws" | "sockjs" | string} [webSocketTransport]
               * @property {string | WebSocketURL} [webSocketURL]
               */
              /**
               * @typedef {Array<{ key: string; value: string }> | Record<string, string | string[]>} Headers
               */
              /**
               * @typedef {{ name?: string, path?: string, middleware: ExpressRequestHandler | ExpressErrorRequestHandler } | ExpressRequestHandler | ExpressErrorRequestHandler} Middleware
               */
              /**
               * @typedef {Object} Configuration
               * @property {boolean | string} [ipc]
               * @property {Host} [host]
               * @property {Port} [port]
               * @property {boolean | "only"} [hot]
               * @property {boolean} [liveReload]
               * @property {DevMiddlewareOptions<Request, Response>} [devMiddleware]
               * @property {boolean} [compress]
               * @property {boolean} [magicHtml]
               * @property {"auto" | "all" | string | string[]} [allowedHosts]
               * @property {boolean | ConnectHistoryApiFallbackOptions} [historyApiFallback]
               * @property {boolean} [setupExitSignals]
               * @property {boolean | Record<string, never> | BonjourOptions} [bonjour]
               * @property {string | string[] | WatchFiles | Array<string | WatchFiles>} [watchFiles]
               * @property {boolean | string | Static | Array<string | Static>} [static]
               * @property {boolean | ServerOptions} [https]
               * @property {boolean} [http2]
               * @property {"http" | "https" | "spdy" | string | ServerConfiguration} [server]
               * @property {boolean | "sockjs" | "ws" | string | WebSocketServerConfiguration} [webSocketServer]
               * @property {ProxyConfigMap | ProxyConfigArrayItem | ProxyConfigArray} [proxy]
               * @property {boolean | string | Open | Array<string | Open>} [open]
               * @property {boolean} [setupExitSignals]
               * @property {boolean | ClientConfiguration} [client]
               * @property {Headers | ((req: Request, res: Response, context: DevMiddlewareContext<Request, Response>) => Headers)} [headers]
               * @property {(devServer: Server) => void} [onAfterSetupMiddleware]
               * @property {(devServer: Server) => void} [onBeforeSetupMiddleware]
               * @property {(devServer: Server) => void} [onListening]
               * @property {(middlewares: Middleware[], devServer: Server) => Middleware[]} [setupMiddlewares]
               */
              type: string;
              cli: {
                negatedDescription: string;
              };
              minimum?: undefined;
            }
          | {
              type: string;
              minimum: number;
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
      };
      ClientWebSocketTransport: {
        anyOf: {
          $ref: string;
        }[];
        /**
         * @typedef {Object} OpenApp
         * @property {string} [name]
         * @property {string[]} [arguments]
         */
        /**
         * @typedef {Object} Open
         * @property {string | string[] | OpenApp} [app]
         * @property {string | string[]} [target]
         */
        /**
         * @typedef {Object} NormalizedOpen
         * @property {string} target
         * @property {import("open").Options} options
         */
        /**
         * @typedef {Object} WebSocketURL
         * @property {string} [hostname]
         * @property {string} [password]
         * @property {string} [pathname]
         * @property {number | string} [port]
         * @property {string} [protocol]
         * @property {string} [username]
         */
        /**
         * @typedef {Object} ClientConfiguration
         * @property {"log" | "info" | "warn" | "error" | "none" | "verbose"} [logging]
         * @property {boolean  | { warnings?: boolean, errors?: boolean }} [overlay]
         * @property {boolean} [progress]
         * @property {boolean | number} [reconnect]
         * @property {"ws" | "sockjs" | string} [webSocketTransport]
         * @property {string | WebSocketURL} [webSocketURL]
         */
        /**
         * @typedef {Array<{ key: string; value: string }> | Record<string, string | string[]>} Headers
         */
        /**
         * @typedef {{ name?: string, path?: string, middleware: ExpressRequestHandler | ExpressErrorRequestHandler } | ExpressRequestHandler | ExpressErrorRequestHandler} Middleware
         */
        /**
         * @typedef {Object} Configuration
         * @property {boolean | string} [ipc]
         * @property {Host} [host]
         * @property {Port} [port]
         * @property {boolean | "only"} [hot]
         * @property {boolean} [liveReload]
         * @property {DevMiddlewareOptions<Request, Response>} [devMiddleware]
         * @property {boolean} [compress]
         * @property {boolean} [magicHtml]
         * @property {"auto" | "all" | string | string[]} [allowedHosts]
         * @property {boolean | ConnectHistoryApiFallbackOptions} [historyApiFallback]
         * @property {boolean} [setupExitSignals]
         * @property {boolean | Record<string, never> | BonjourOptions} [bonjour]
         * @property {string | string[] | WatchFiles | Array<string | WatchFiles>} [watchFiles]
         * @property {boolean | string | Static | Array<string | Static>} [static]
         * @property {boolean | ServerOptions} [https]
         * @property {boolean} [http2]
         * @property {"http" | "https" | "spdy" | string | ServerConfiguration} [server]
         * @property {boolean | "sockjs" | "ws" | string | WebSocketServerConfiguration} [webSocketServer]
         * @property {ProxyConfigMap | ProxyConfigArrayItem | ProxyConfigArray} [proxy]
         * @property {boolean | string | Open | Array<string | Open>} [open]
         * @property {boolean} [setupExitSignals]
         * @property {boolean | ClientConfiguration} [client]
         * @property {Headers | ((req: Request, res: Response, context: DevMiddlewareContext<Request, Response>) => Headers)} [headers]
         * @property {(devServer: Server) => void} [onAfterSetupMiddleware]
         * @property {(devServer: Server) => void} [onBeforeSetupMiddleware]
         * @property {(devServer: Server) => void} [onListening]
         * @property {(middlewares: Middleware[], devServer: Server) => Middleware[]} [setupMiddlewares]
         */
        description: string;
        link: string;
      };
      ClientWebSocketTransportEnum: {
        enum: string[];
      };
      ClientWebSocketTransportString: {
        type: string;
        minLength: number;
        /**
         * @typedef {Object} WebSocketURL
         * @property {string} [hostname]
         * @property {string} [password]
         * @property {string} [pathname]
         * @property {number | string} [port]
         * @property {string} [protocol]
         * @property {string} [username]
         */
      };
      ClientWebSocketURL: {
        description: string;
        link: string;
        anyOf: (
          | {
              type: string;
              minLength: number;
              additionalProperties?: undefined;
              properties?: undefined;
            }
          | {
              type: string;
              additionalProperties: boolean;
              properties: {
                hostname: {
                  description: string;
                  type: string;
                  minLength: number;
                };
                pathname: {
                  description: string;
                  type: string;
                };
                password: {
                  description: string;
                  type: string;
                };
                port: {
                  description: string;
                  anyOf: (
                    | {
                        type: string;
                        minLength?: undefined;
                      }
                    | {
                        type: string;
                        minLength: number;
                      }
                  )[];
                };
                protocol: {
                  description: string;
                  anyOf: (
                    | {
                        enum: string[];
                        type?: undefined;
                        minLength?: undefined;
                      }
                    | {
                        type: string;
                        minLength: number;
                        enum?: undefined;
                      }
                  )[];
                };
                username: {
                  description: string;
                  type: string;
                };
              };
              minLength?: undefined;
            }
        )[];
      };
      Compress: {
        type: string;
        description: string;
        link: string;
        cli: {
          negatedDescription: string;
        };
      };
      DevMiddleware: {
        description: string;
        link: string;
        type: string;
        additionalProperties: boolean;
      };
      HTTP2: {
        type: string;
        description: string;
        link: string;
        cli: {
          negatedDescription: string;
        };
      };
      HTTPS: {
        anyOf: (
          | {
              type: string;
              cli: {
                negatedDescription: string;
              };
              additionalProperties?: undefined;
              properties?: undefined;
            }
          | {
              type: string;
              additionalProperties: boolean;
              properties: {
                passphrase: {
                  type: string;
                  description: string;
                };
                requestCert: {
                  type: string;
                  description: string;
                  cli: {
                    negatedDescription: string;
                  };
                };
                ca: {
                  anyOf: (
                    | {
                        type: string;
                        items: {
                          anyOf: (
                            | {
                                type: string;
                                instanceof?: undefined;
                              }
                            | {
                                instanceof: string;
                                type?: undefined;
                              }
                          )[];
                        };
                        instanceof?: undefined;
                      }
                    | {
                        type: string;
                        items?: undefined;
                        instanceof?: undefined;
                      }
                    | {
                        instanceof: string;
                        type?: undefined;
                        items?: undefined;
                      }
                  )[];
                  description: string;
                };
                cacert: {
                  anyOf: (
                    | {
                        type: string;
                        items: {
                          anyOf: (
                            | {
                                type: string;
                                instanceof?: undefined;
                              }
                            | {
                                instanceof: string;
                                type?: undefined;
                              }
                          )[];
                        };
                        instanceof?: undefined;
                      }
                    | {
                        type: string;
                        items?: undefined;
                        instanceof?: undefined;
                      }
                    | {
                        instanceof: string;
                        type?: undefined;
                        items?: undefined;
                      }
                  )[];
                  description: string;
                };
                cert: {
                  anyOf: (
                    | {
                        type: string;
                        items: {
                          anyOf: (
                            | {
                                type: string;
                                instanceof?: undefined;
                              }
                            | {
                                instanceof: string;
                                type?: undefined;
                              }
                          )[];
                        };
                        instanceof?: undefined;
                      }
                    | {
                        type: string;
                        items?: undefined;
                        instanceof?: undefined;
                      }
                    | {
                        instanceof: string;
                        type?: undefined;
                        items?: undefined;
                      }
                  )[];
                  description: string;
                };
                crl: {
                  anyOf: (
                    | {
                        type: string;
                        items: {
                          anyOf: (
                            | {
                                type: string;
                                instanceof?: undefined;
                              }
                            | {
                                instanceof: string;
                                type?: undefined;
                              }
                          )[];
                        };
                        instanceof?: undefined;
                      }
                    | {
                        type: string;
                        items?: undefined;
                        instanceof?: undefined;
                      }
                    | {
                        instanceof: string;
                        type?: undefined;
                        items?: undefined;
                      }
                  )[];
                  description: string;
                };
                key: {
                  anyOf: (
                    | {
                        type: string;
                        items: {
                          anyOf: (
                            | {
                                type: string;
                                instanceof?: undefined;
                                additionalProperties?: undefined;
                              }
                            | {
                                instanceof: string;
                                type?: undefined;
                                additionalProperties?: undefined;
                              }
                            | {
                                type: string;
                                additionalProperties: boolean;
                                instanceof?: undefined;
                              }
                          )[];
                        };
                        instanceof?: undefined;
                      }
                    | {
                        type: string;
                        items?: undefined;
                        instanceof?: undefined;
                      }
                    | {
                        instanceof: string;
                        type?: undefined;
                        items?: undefined;
                      }
                  )[];
                  description: string;
                };
                pfx: {
                  anyOf: (
                    | {
                        type: string;
                        items: {
                          anyOf: (
                            | {
                                type: string;
                                instanceof?: undefined;
                                additionalProperties?: undefined;
                              }
                            | {
                                instanceof: string;
                                type?: undefined;
                                additionalProperties?: undefined;
                              }
                            | {
                                type: string;
                                additionalProperties: boolean;
                                instanceof?: undefined;
                              }
                          )[];
                        };
                        instanceof?: undefined;
                      }
                    | {
                        type: string;
                        items?: undefined;
                        instanceof?: undefined;
                      }
                    | {
                        instanceof: string;
                        type?: undefined;
                        items?: undefined;
                      }
                  )[];
                  description: string;
                };
              };
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
        description: string;
        link: string;
      };
      HeaderObject: {
        type: string;
        additionalProperties: boolean;
        properties: {
          key: {
            description: string;
            type: string;
          };
          value: {
            description: string;
            type: string;
          };
        };
        cli: {
          exclude: boolean;
        };
      };
      Headers: {
        anyOf: (
          | {
              type: string;
              items: {
                $ref: string;
              };
              minItems: number;
              instanceof?: undefined;
            }
          | {
              type: string;
              items?: undefined;
              minItems?: undefined;
              instanceof?: undefined;
            }
          | {
              instanceof: string;
              type?: undefined;
              items?: undefined;
              minItems?: undefined;
            }
        )[];
        description: string;
        link: string;
      };
      /**
       * @type {string[]}
       */
      HistoryApiFallback: {
        anyOf: (
          | {
              type: string;
              cli: {
                negatedDescription: string;
              };
              description?: undefined;
              link?: undefined;
            }
          | {
              type: string;
              description: string;
              link: string;
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
        description: string;
        link: string;
      };
      Host: {
        description: string;
        link: string;
        anyOf: (
          | {
              enum: string[];
              type?: undefined;
              minLength?: undefined;
            }
          | {
              type: string;
              minLength: number;
              enum?: undefined;
            }
        )[];
      };
      Hot: {
        anyOf: (
          | {
              type: string;
              cli: {
                negatedDescription: string;
              };
              enum?: undefined;
            }
          | {
              enum: string[];
              type?: undefined;
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
        description: string;
        link: string;
      };
      IPC: {
        anyOf: (
          | {
              type: string;
              minLength: number;
              enum?: undefined;
            }
          | {
              type: string;
              enum: boolean[];
              minLength?: undefined;
            }
        )[];
        description: string;
        link: string;
      };
      LiveReload: {
        type: string;
        description: string;
        cli: {
          negatedDescription: string;
        };
        link: string;
      };
      MagicHTML: {
        type: string;
        description: string;
        cli: {
          negatedDescription: string;
        };
        /** @type {number | string} */ link: string;
      };
      OnAfterSetupMiddleware: {
        instanceof: string;
        description: string;
        link: string;
      };
      OnBeforeSetupMiddleware: {
        instanceof: string;
        description: string;
        link: string;
      };
      OnListening: {
        instanceof: string;
        description: string;
        link: string;
      };
      /** @type {string} */
      Open: {
        anyOf: (
          | {
              type: string;
              items: {
                anyOf: {
                  $ref: string;
                }[];
              };
              $ref?: undefined;
            }
          | {
              $ref: string;
              type?: undefined;
              items?: undefined;
            }
        )[];
        description: string;
        link: string;
      };
      OpenBoolean: {
        type: string;
        cli: {
          negatedDescription: string;
        };
      };
      OpenObject: {
        type: string;
        additionalProperties: boolean;
        properties: {
          target: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    type: string;
                  };
                }
              | {
                  type: string;
                  items?: undefined;
                }
            )[];
            description: string;
          };
          app: {
            anyOf: (
              | {
                  type: string;
                  additionalProperties: boolean;
                  properties: {
                    name: {
                      anyOf: (
                        | {
                            type: string;
                            items: {
                              type: string;
                              minLength: number;
                            };
                            minItems: number;
                            minLength?: undefined;
                          }
                        | {
                            type: string;
                            minLength: number;
                            items?: undefined;
                            minItems?: undefined;
                          }
                      )[];
                    };
                    arguments: {
                      items: {
                        type: string;
                        minLength: number;
                      };
                    };
                  };
                  minLength?: undefined;
                  description?: undefined;
                  cli?: undefined /** @typedef {import("express").Request} Request */;
                }
              | {
                  type: string;
                  minLength: number;
                  description: string;
                  cli: {
                    description: string;
                  };
                  additionalProperties?: undefined;
                  properties?: undefined;
                }
            )[];
            /**
             * @private
             * @returns {Compiler["options"]}
             */
            description: string;
          };
        };
      };
      OpenString: {
        type: string;
        minLength: number;
      };
      Port: {
        anyOf: (
          | {
              type: string;
              minimum: number;
              maximum: number;
              minLength?: undefined;
              enum?: undefined;
            }
          | {
              type: string;
              minLength: number;
              minimum?: undefined;
              maximum?: undefined;
              enum?: undefined;
            }
          | {
              enum: string[];
              type?: undefined;
              minimum?: undefined;
              maximum?: undefined;
              minLength?: undefined;
            }
        )[];
        description: string;
        link: string;
      };
      Proxy: {
        anyOf: (
          | {
              type: string;
              items?: undefined;
            }
          | {
              type: string;
              items: {
                anyOf: (
                  | {
                      type: string;
                      instanceof?: undefined;
                    }
                  | {
                      instanceof: string;
                      type?: undefined;
                    }
                )[];
              };
            }
        )[];
        description: string;
        link: string;
      };
      Server: {
        anyOf: {
          $ref: string;
        }[];
        link: string;
        description: string;
      };
      ServerType: {
        enum: string[];
      };
      ServerEnum: {
        enum: string[];
        cli: {
          exclude: boolean;
        };
      };
      ServerString: {
        type: string;
        minLength: number;
        cli: {
          exclude: boolean;
        };
      };
      ServerObject: {
        type: string;
        properties: {
          type: {
            anyOf: {
              $ref: string;
            }[];
          };
          options: {
            $ref: string;
          };
        };
        additionalProperties: boolean;
      };
      ServerOptions: {
        type: string;
        additionalProperties: boolean;
        properties: {
          passphrase: {
            type: string;
            description: string;
          };
          requestCert: {
            type: string;
            description: string;
            cli: {
              negatedDescription: string;
            };
          };
          ca: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    anyOf: (
                      | {
                          type: string;
                          instanceof?: undefined;
                        }
                      | {
                          instanceof: string;
                          type?: undefined;
                        }
                    )[];
                  };
                  instanceof?: undefined;
                }
              | {
                  type: string;
                  items?: undefined;
                  instanceof?: undefined;
                }
              | {
                  instanceof: string;
                  type?: undefined;
                  items?: undefined;
                }
            )[];
            description: string;
          };
          cacert: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    anyOf: (
                      | {
                          type: string;
                          instanceof?: undefined;
                        }
                      | {
                          instanceof: string;
                          type?: undefined;
                        }
                    )[];
                  };
                  instanceof?: undefined;
                }
              | {
                  type: string;
                  items?: undefined;
                  instanceof?: undefined;
                }
              | {
                  instanceof: string;
                  type?: undefined;
                  items?: undefined;
                }
            )[];
            description: string;
          };
          cert: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    anyOf: (
                      | {
                          type: string;
                          instanceof?: undefined;
                        }
                      | {
                          instanceof: string;
                          type?: undefined;
                        }
                    )[];
                  };
                  instanceof?: undefined;
                }
              | {
                  type: string;
                  items?: undefined;
                  instanceof?: undefined;
                }
              | {
                  instanceof: string;
                  type?: undefined;
                  items?: undefined;
                }
            )[];
            description: string;
          };
          crl: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    anyOf: (
                      | {
                          type: string;
                          instanceof?: undefined;
                        }
                      | {
                          instanceof: string;
                          type?: undefined;
                        }
                    )[];
                  };
                  instanceof?: undefined;
                }
              | {
                  type: string;
                  items?: undefined;
                  instanceof?: undefined;
                }
              | {
                  instanceof: string;
                  type?: undefined;
                  items?: undefined;
                }
            )[];
            description: string;
          };
          key: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    anyOf: (
                      | {
                          type: string;
                          instanceof?: undefined;
                          additionalProperties?: undefined;
                        }
                      | {
                          instanceof: string;
                          type?: undefined;
                          additionalProperties?: undefined;
                        }
                      | {
                          type: string;
                          additionalProperties: boolean;
                          instanceof?: undefined;
                        }
                    )[];
                  };
                  instanceof?: undefined;
                }
              | {
                  type: string;
                  items?: undefined;
                  instanceof?: undefined;
                }
              | {
                  instanceof: string;
                  type?: undefined;
                  items?: undefined;
                }
            )[];
            description: string;
          };
          pfx: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    anyOf: (
                      | {
                          type: string;
                          instanceof?: undefined;
                          additionalProperties?: undefined;
                        }
                      | {
                          instanceof: string;
                          type?: undefined;
                          additionalProperties?: undefined;
                        }
                      | {
                          type: string;
                          additionalProperties: boolean;
                          instanceof?: undefined;
                        }
                    )[];
                  };
                  instanceof?: undefined;
                }
              | {
                  type: string;
                  items?: undefined;
                  instanceof?: undefined;
                }
              | {
                  instanceof: string;
                  type?: undefined;
                  items?: undefined;
                }
            )[];
            description: string;
          };
        };
      };
      SetupExitSignals: {
        type: string;
        description: string;
        link: string;
        cli: {
          exclude: boolean;
        };
      };
      SetupMiddlewares: {
        instanceof: string;
        description: string;
        link: string;
      };
      Static: {
        anyOf: (
          | {
              type: string;
              items: {
                anyOf: {
                  $ref: string;
                }[];
              };
              cli?: undefined /** @typedef {import("express").Request} Request */;
              $ref?: undefined;
            }
          | {
              type: string;
              cli: {
                negatedDescription: string;
              };
              items?: undefined;
              $ref?: undefined;
            }
          | {
              $ref: string;
              type?: undefined;
              items?: undefined;
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
        description: string;
        link: string;
      };
      StaticObject: {
        type: string;
        additionalProperties: boolean;
        properties: {
          directory: {
            type: string;
            minLength: number;
            description: string;
            link: string;
          };
          staticOptions: {
            type: string;
            link: string;
            additionalProperties: boolean;
          };
          publicPath: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    type: string;
                  };
                  minItems: number;
                }
              | {
                  type: string;
                  items?: undefined;
                  minItems?: undefined;
                }
            )[];
            description: string;
            link: string;
          };
          serveIndex: {
            anyOf: (
              | {
                  type: string;
                  cli: {
                    negatedDescription: string;
                  };
                  additionalProperties?: undefined;
                }
              | {
                  type: string;
                  additionalProperties: boolean;
                  cli?: undefined /** @typedef {import("express").Request} Request */;
                }
            )[];
            description: string;
            link: string;
          };
          watch: {
            anyOf: (
              | {
                  type: string;
                  cli: {
                    negatedDescription: string;
                  };
                  description?: undefined;
                  link?: undefined;
                }
              | {
                  type: string;
                  description: string;
                  link: string;
                  cli?: undefined /** @typedef {import("express").Request} Request */;
                }
            )[];
            description: string;
            link: string;
          };
        };
      };
      StaticString: {
        type: string;
        minLength: number;
      };
      WatchFiles: {
        anyOf: (
          | {
              type: string;
              items: {
                anyOf: {
                  $ref: string;
                }[];
              };
              $ref?: undefined;
            }
          | {
              $ref: string;
              type?: undefined;
              items?: undefined;
            }
        )[];
        description: string;
        link: string;
      };
      WatchFilesObject: {
        cli: {
          exclude: boolean;
        };
        type: string;
        properties: {
          paths: {
            anyOf: (
              | {
                  type: string;
                  items: {
                    type: string;
                    minLength: number;
                  };
                  minLength?: undefined;
                }
              | {
                  type: string;
                  minLength: number;
                  /** @type {Array<keyof ServerOptions>} */ items?: undefined;
                }
            )[];
            description: string;
          };
          options: {
            type: string;
            description: string;
            link: string;
            additionalProperties: boolean;
          };
        };
        additionalProperties: boolean;
      };
      WatchFilesString: {
        type: string;
        minLength: number;
      };
      WebSocketServer: {
        anyOf: {
          $ref: string;
        }[];
        description: string;
        link: string;
      };
      WebSocketServerType: {
        enum: string[];
      };
      WebSocketServerEnum: {
        anyOf: (
          | {
              enum: boolean[];
              cli: {
                negatedDescription: string;
              };
              $ref?: undefined;
            }
          | {
              $ref: string;
              enum?: undefined;
              cli?: undefined /** @typedef {import("express").Request} Request */;
            }
        )[];
        cli: {
          description: string;
        };
      };
      WebSocketServerFunction: {
        instanceof: string;
      };
      WebSocketServerObject: {
        type: string;
        properties: {
          type: {
            anyOf: {
              $ref: string;
            }[];
          };
          options: {
            type: string;
            additionalProperties: boolean;
            cli: {
              exclude: boolean;
            };
          };
        };
        additionalProperties: boolean;
      };
      WebSocketServerString: {
        type: string;
        minLength: number;
      };
    };
    additionalProperties: boolean;
    properties: {
      allowedHosts: {
        $ref: string;
      };
      bonjour: {
        $ref: string;
      };
      client: {
        $ref: string;
      };
      compress: {
        $ref: string;
      };
      devMiddleware: {
        $ref: string;
      };
      headers: {
        $ref: string;
      };
      historyApiFallback: {
        $ref: string;
      };
      host: {
        $ref: string;
      };
      hot: {
        $ref: string;
      };
      http2: {
        $ref: string;
      };
      https: {
        $ref: string;
      };
      ipc: {
        $ref: string;
      };
      liveReload: {
        $ref: string;
      };
      magicHtml: {
        $ref: string;
      };
      onAfterSetupMiddleware: {
        $ref: string;
      };
      onBeforeSetupMiddleware: {
        $ref: string;
      };
      onListening: {
        $ref: string;
      };
      open: {
        $ref: string;
      };
      port: {
        $ref: string;
      };
      proxy: {
        $ref: string;
      };
      server: {
        $ref: string;
      };
      setupExitSignals: {
        $ref: string;
      };
      setupMiddlewares: {
        $ref: string;
      };
      static: {
        $ref: string;
      };
      watchFiles: {
        $ref: string;
      };
      webSocketServer: {
        $ref: string;
      };
    };
  };
  /**
   * @param {string} URL
   * @returns {boolean}
   */
  static isAbsoluteURL(URL: string): boolean;
  /**
   * @param {string} gateway
   * @returns {string | undefined}
   */
  static findIp(gateway: string): string | undefined;
  /**
   * @param {"v4" | "v6"} family
   * @returns {Promise<string | undefined>}
   */
  static internalIP(family: "v4" | "v6"): Promise<string | undefined>;
  /**
   * @param {"v4" | "v6"} family
   * @returns {string | undefined}
   */
  static internalIPSync(family: "v4" | "v6"): string | undefined;
  /**
   * @param {Host} hostname
   * @returns {Promise<string>}
   */
  static getHostname(hostname: Host): Promise<string>;
  /**
   * @param {Port} port
   * @param {string} host
   * @returns {Promise<number | string>}
   */
  static getFreePort(port: Port, host: string): Promise<number | string>;
  /**
   * @returns {string}
   */
  static findCacheDir(): string;
  /**
   * @private
   * @param {Compiler} compiler
   * @returns bool
   */
  private static isWebTarget;
  /**
   * @param {Configuration | Compiler | MultiCompiler} options
   * @param {Compiler | MultiCompiler | Configuration} compiler
   */
  constructor(
    options:
      | import("webpack").Compiler
      | import("webpack").MultiCompiler
      | Configuration
      | undefined,
    compiler: Compiler | MultiCompiler | Configuration
  );
  compiler: import("webpack").Compiler | import("webpack").MultiCompiler;
  /**
   * @type {ReturnType<Compiler["getInfrastructureLogger"]>}
   * */
  logger: ReturnType<Compiler["getInfrastructureLogger"]>;
  options: Configuration;
  /**
   * @type {FSWatcher[]}
   */
  staticWatchers: FSWatcher[];
  /**
   * @private
   * @type {{ name: string | symbol, listener: (...args: any[]) => void}[] }}
   */
  private listeners;
  /**
   * @private
   * @type {RequestHandler[]}
   */
  private webSocketProxies;
  /**
   * @type {Socket[]}
   */
  sockets: Socket[];
  /**
   * @private
   * @type {string | undefined}
   */
  private currentHash;
  /**
   * @private
   * @param {Compiler} compiler
   */
  private addAdditionalEntries;
  /**
   * @private
   * @returns {Compiler["options"]}
   */
  private getCompilerOptions;
  /**
   * @private
   * @returns {Promise<void>}
   */
  private normalizeOptions;
  /**
   * @private
   * @returns {string}
   */
  private getClientTransport;
  /**
   * @private
   * @returns {string}
   */
  private getServerTransport;
  /**
   * @private
   * @returns {void}
   */
  private setupProgressPlugin;
  /**
   * @private
   * @returns {Promise<void>}
   */
  private initialize;
  /**
   * @private
   * @returns {void}
   */
  private setupApp;
  /** @type {import("express").Application | undefined}*/
  app: import("express").Application | undefined;
  /**
   * @private
   * @param {Stats | MultiStats} statsObj
   * @returns {StatsCompilation}
   */
  private getStats;
  /**
   * @private
   * @returns {void}
   */
  private setupHooks;
  /**
   * @private
   * @type {Stats | MultiStats}
   */
  private stats;
  /**
   * @private
   * @returns {void}
   */
  private setupHostHeaderCheck;
  /**
   * @private
   * @returns {void}
   */
  private setupDevMiddleware;
  middleware:
    | import("webpack-dev-middleware").API<
        express.Request<
          import("express-serve-static-core").ParamsDictionary,
          any,
          any,
          qs.ParsedQs,
          Record<string, any>
        >,
        express.Response<any, Record<string, any>>
      >
    | null
    | undefined;
  /**
   * @private
   * @returns {void}
   */
  private setupBuiltInRoutes;
  /**
   * @private
   * @returns {void}
   */
  private setupWatchStaticFiles;
  /**
   * @private
   * @returns {void}
   */
  private setupWatchFiles;
  /**
   * @private
   * @returns {void}
   */
  private setupMiddlewares;
  /**
   * @private
   * @returns {void}
   */
  private createServer;
  /** @type {import("http").Server | undefined | null} */
  server: import("http").Server | undefined | null;
  /**
   * @private
   * @returns {void}
   */
  private createWebSocketServer;
  /** @type {WebSocketServerImplementation | undefined | null} */
  webSocketServer: WebSocketServerImplementation | undefined | null;
  /**
   * @private
   * @param {string} defaultOpenTarget
   * @returns {void}
   */
  private openBrowser;
  /**
   * @private
   * @returns {void}
   */
  private runBonjour;
  /**
   * @private
   * @type {Bonjour | undefined}
   */
  private bonjour;
  /**
   * @private
   * @returns {void}
   */
  private stopBonjour;
  /**
   * @private
   * @returns {void}
   */
  private logStatus;
  /**
   * @private
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   */
  private setHeaders;
  /**
   * @private
   * @param {{ [key: string]: string | undefined }} headers
   * @param {string} headerToCheck
   * @returns {boolean}
   */
  private checkHeader;
  /**
   * @param {ClientConnection[]} clients
   * @param {string} type
   * @param {any} [data]
   * @param {any} [params]
   */
  sendMessage(
    clients: ClientConnection[],
    type: string,
    data?: any,
    params?: any
  ): void;
  /**
   * @private
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {void}
   */
  private serveMagicHtml;
  /**
   * @private
   * @param {ClientConnection[]} clients
   * @param {StatsCompilation} stats
   * @param {boolean} [force]
   */
  private sendStats;
  /**
   * @param {string | string[]} watchPath
   * @param {WatchOptions} [watchOptions]
   */
  watchFiles(
    watchPath: string | string[],
    watchOptions?: import("chokidar").WatchOptions | undefined
  ): void;
  /**
   * @param {import("webpack-dev-middleware").Callback} [callback]
   */
  invalidate(
    callback?: import("webpack-dev-middleware").Callback | undefined
  ): void;
  /**
   * @returns {Promise<void>}
   */
  start(): Promise<void>;
  /**
   * @param {(err?: Error) => void} [callback]
   */
  startCallback(callback?: ((err?: Error) => void) | undefined): void;
  /**
   * @returns {Promise<void>}
   */
  stop(): Promise<void>;
  /**
   * @param {(err?: Error) => void} [callback]
   */
  stopCallback(callback?: ((err?: Error) => void) | undefined): void;
  /**
   * @param {Port} port
   * @param {Host} hostname
   * @param {(err?: Error) => void} fn
   * @returns {void}
   */
  listen(port: Port, hostname: Host, fn: (err?: Error) => void): void;
  /**
   * @param {(err?: Error) => void} [callback]
   * @returns {void}
   */
  close(callback?: ((err?: Error) => void) | undefined): void;
}
declare namespace Server {
  export {
    DEFAULT_STATS,
    Schema,
    Compiler,
    MultiCompiler,
    WebpackConfiguration,
    StatsOptions,
    StatsCompilation,
    Stats,
    MultiStats,
    NetworkInterfaceInfo,
    Request,
    Response,
    NextFunction,
    ExpressRequestHandler,
    ExpressErrorRequestHandler,
    WatchOptions,
    FSWatcher,
    ConnectHistoryApiFallbackOptions,
    Bonjour,
    BonjourOptions,
    RequestHandler,
    HttpProxyMiddlewareOptions,
    HttpProxyMiddlewareOptionsFilter,
    ServeIndexOptions,
    ServeStaticOptions,
    IPv4,
    IPv6,
    Socket,
    IncomingMessage,
    OpenOptions,
    ServerOptions,
    DevMiddlewareOptions,
    DevMiddlewareContext,
    Host,
    Port,
    WatchFiles,
    Static,
    NormalizedStatic,
    ServerConfiguration,
    WebSocketServerConfiguration,
    ClientConnection,
    WebSocketServer,
    WebSocketServerImplementation,
    ByPass,
    ProxyConfigArrayItem,
    ProxyConfigArray,
    ProxyConfigMap,
    OpenApp,
    Open,
    NormalizedOpen,
    WebSocketURL,
    ClientConfiguration,
    Headers,
    Middleware,
    Configuration,
  };
}
type Compiler = import("webpack").Compiler;
type Configuration = {
  ipc?: string | boolean | undefined;
  host?: string | undefined;
  port?: Port | undefined;
  hot?: boolean | "only" | undefined;
  liveReload?: boolean | undefined;
  devMiddleware?:
    | DevMiddlewareOptions<
        express.Request<
          import("express-serve-static-core").ParamsDictionary,
          any,
          any,
          qs.ParsedQs,
          Record<string, any>
        >,
        express.Response<any, Record<string, any>>
      >
    | undefined;
  compress?: boolean | undefined;
  magicHtml?: boolean | undefined;
  allowedHosts?: string | string[] | undefined;
  historyApiFallback?:
    | boolean
    | import("connect-history-api-fallback").Options
    | undefined;
  setupExitSignals?: boolean | undefined;
  bonjour?:
    | boolean
    | Record<string, never>
    | import("bonjour-service").Service
    | undefined;
  watchFiles?:
    | string
    | string[]
    | WatchFiles
    | (string | WatchFiles)[]
    | undefined;
  static?: string | boolean | Static | (string | Static)[] | undefined;
  https?: boolean | ServerOptions | undefined;
  http2?: boolean | undefined;
  server?: string | ServerConfiguration | undefined;
  webSocketServer?: string | boolean | WebSocketServerConfiguration | undefined;
  proxy?: ProxyConfigArrayItem | ProxyConfigMap | ProxyConfigArray | undefined;
  open?: string | boolean | Open | (string | Open)[] | undefined;
  client?: boolean | ClientConfiguration | undefined;
  headers?:
    | Headers
    | ((
        req: Request,
        res: Response,
        context: DevMiddlewareContext<Request, Response>
      ) => Headers)
    | undefined;
  onAfterSetupMiddleware?: ((devServer: Server) => void) | undefined;
  onBeforeSetupMiddleware?: ((devServer: Server) => void) | undefined;
  onListening?: ((devServer: Server) => void) | undefined;
  setupMiddlewares?:
    | ((middlewares: Middleware[], devServer: Server) => Middleware[])
    | undefined;
};
type FSWatcher = import("chokidar").FSWatcher;
type Socket = import("net").Socket;
import express = require("express");
type WebSocketServerImplementation = {
  implementation: WebSocketServer;
  clients: ClientConnection[];
};
type ClientConnection = (
  | import("ws").WebSocket
  | (import("sockjs").Connection & {
      send: import("ws").WebSocket["send"];
      terminate: import("ws").WebSocket["terminate"];
      ping: import("ws").WebSocket["ping"];
    })
) & {
  isAlive?: boolean;
};
type Port = number | string | "auto";
type Host = "local-ip" | "local-ipv4" | "local-ipv6" | string;
type MultiCompiler = import("webpack").MultiCompiler;
declare class DEFAULT_STATS {
  private constructor();
}
type Schema = import("schema-utils/declarations/validate").Schema;
type WebpackConfiguration = import("webpack").Configuration;
type StatsOptions = import("webpack").StatsOptions;
type StatsCompilation = import("webpack").StatsCompilation;
type Stats = import("webpack").Stats;
type MultiStats = import("webpack").MultiStats;
type NetworkInterfaceInfo = import("os").NetworkInterfaceInfo;
type Request = import("express").Request;
type Response = import("express").Response;
type NextFunction = import("express").NextFunction;
type ExpressRequestHandler = import("express").RequestHandler;
type ExpressErrorRequestHandler = import("express").ErrorRequestHandler;
type WatchOptions = import("chokidar").WatchOptions;
type ConnectHistoryApiFallbackOptions =
  import("connect-history-api-fallback").Options;
type Bonjour = import("bonjour-service").Bonjour;
type BonjourOptions = import("bonjour-service").Service;
type RequestHandler = import("http-proxy-middleware").RequestHandler;
type HttpProxyMiddlewareOptions = import("http-proxy-middleware").Options;
type HttpProxyMiddlewareOptionsFilter = import("http-proxy-middleware").Filter;
type ServeIndexOptions = import("serve-index").Options;
type ServeStaticOptions = import("serve-static").ServeStaticOptions;
type IPv4 = import("ipaddr.js").IPv4;
type IPv6 = import("ipaddr.js").IPv6;
type IncomingMessage = import("http").IncomingMessage;
type OpenOptions = import("open").Options;
type ServerOptions = import("https").ServerOptions & {
  spdy?: {
    plain?: boolean | undefined;
    ssl?: boolean | undefined;
    "x-forwarded-for"?: string | undefined;
    protocol?: string | undefined;
    protocols?: string[] | undefined;
  };
};
type DevMiddlewareOptions<Request_1, Response_1> =
  import("webpack-dev-middleware").Options<Request, Response>;
type DevMiddlewareContext<Request_1, Response_1> =
  import("webpack-dev-middleware").Context<Request, Response>;
type WatchFiles = {
  paths: string | string[];
  options?:
    | (import("chokidar").WatchOptions & {
        aggregateTimeout?: number | undefined;
        ignored?: WatchOptions["ignored"];
        poll?: number | boolean | undefined;
      })
    | undefined;
};
type Static = {
  directory?: string | undefined;
  publicPath?: string | string[] | undefined;
  serveIndex?: boolean | import("serve-index").Options | undefined;
  staticOptions?:
    | import("serve-static").ServeStaticOptions<
        import("http").ServerResponse<import("http").IncomingMessage>
      >
    | undefined;
  watch?:
    | boolean
    | (import("chokidar").WatchOptions & {
        aggregateTimeout?: number | undefined;
        ignored?: WatchOptions["ignored"];
        poll?: number | boolean | undefined;
      })
    | undefined;
};
type NormalizedStatic = {
  directory: string;
  publicPath: string[];
  serveIndex: false | ServeIndexOptions;
  staticOptions: ServeStaticOptions;
  watch: false | WatchOptions;
};
type ServerConfiguration = {
  type?: string | undefined;
  options?: ServerOptions | undefined;
};
type WebSocketServerConfiguration = {
  type?: string | Function | undefined;
  options?: Record<string, any> | undefined;
};
type WebSocketServer =
  | import("ws").WebSocketServer
  | (import("sockjs").Server & {
      close: import("ws").WebSocketServer["close"];
    });
type ByPass = (
  req: Request,
  res: Response,
  proxyConfig: ProxyConfigArrayItem
) => any;
type ProxyConfigArrayItem = {
  path?: HttpProxyMiddlewareOptionsFilter | undefined;
  context?: HttpProxyMiddlewareOptionsFilter | undefined;
} & {
  bypass?: ByPass;
} & HttpProxyMiddlewareOptions;
type ProxyConfigArray = (
  | ProxyConfigArrayItem
  | ((
      req?: Request | undefined,
      res?: Response | undefined,
      next?: NextFunction | undefined
    ) => ProxyConfigArrayItem)
)[];
type ProxyConfigMap = {
  [url: string]: string | ProxyConfigArrayItem;
};
type OpenApp = {
  name?: string | undefined;
  arguments?: string[] | undefined;
};
type Open = {
  app?: string | string[] | OpenApp | undefined;
  target?: string | string[] | undefined;
};
type NormalizedOpen = {
  target: string;
  options: import("open").Options;
};
type WebSocketURL = {
  hostname?: string | undefined;
  password?: string | undefined;
  pathname?: string | undefined;
  port?: string | number | undefined;
  protocol?: string | undefined;
  username?: string | undefined;
};
type ClientConfiguration = {
  logging?: "none" | "error" | "log" | "verbose" | "warn" | "info" | undefined;
  overlay?:
    | boolean
    | {
        warnings?: boolean | undefined;
        errors?: boolean | undefined;
      }
    | undefined;
  progress?: boolean | undefined;
  reconnect?: number | boolean | undefined;
  webSocketTransport?: string | undefined;
  webSocketURL?: string | WebSocketURL | undefined;
};
type Headers =
  | Array<{
      key: string;
      value: string;
    }>
  | Record<string, string | string[]>;
type Middleware =
  | {
      name?: string;
      path?: string;
      middleware: ExpressRequestHandler | ExpressErrorRequestHandler;
    }
  | ExpressRequestHandler
  | ExpressErrorRequestHandler;
import path = require("path");

// DO NOT REMOVE THIS!
type DevServerConfiguration = Configuration;
declare module "webpack" {
  interface Configuration {
    /**
     * Can be used to configure the behaviour of webpack-dev-server when
     * the webpack config is passed to webpack-dev-server CLI.
     */
    devServer?: DevServerConfiguration | undefined;
  }
}
