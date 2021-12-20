/// <reference types="node" />
import { Configuration } from "webpack";

declare const _exports: typeof Server & {
  readonly schema: {
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
              description?: undefined;
              link?: undefined;
            }
          | {
              type: string;
              description: string;
              link: string;
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
            }
        )[];
      };
      ClientLogging: {
        enum: string[];
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
         * @property {WatchOptions & { aggregateTimeout?: number, ignored?: string | RegExp | string[], poll?: number | boolean }} [options]
         */
        /**
         * @typedef {Object} Static
         * @property {string} [directory]
         * @property {string | string[]} [publicPath]
         * @property {boolean | ServeIndexOptions} [serveIndex]
         * @property {ServeStaticOptions} [staticOptions]
         * @property {boolean | WatchOptions & { aggregateTimeout?: number, ignored?: string | RegExp | string[], poll?: number | boolean }} [watch]
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
         * @typedef {{ [url: string]: string | HttpProxyMiddlewareOptions }} ProxyConfigMap
         */
        /**
         * @typedef {HttpProxyMiddlewareOptions[]} ProxyArray
         */
        /**
         * @callback ByPass
         * @param {Request} req
         * @param {Response} res
         * @param {ProxyConfigArray} proxyConfig
         */
        /**
         * @typedef {{ path?: string | string[] | undefined, context?: string | string[] | HttpProxyMiddlewareOptionsFilter | undefined } & HttpProxyMiddlewareOptions & ByPass} ProxyConfigArray
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
         * @property {boolean | BonjourOptions} [bonjour]
         * @property {string | string[] | WatchFiles | Array<string | WatchFiles>} [watchFiles]
         * @property {boolean | string | Static | Array<string | Static>} [static]
         * @property {boolean | ServerOptions} [https]
         * @property {boolean} [http2]
         * @property {"http" | "https" | "spdy" | string | ServerConfiguration} [server]
         * @property {boolean | "sockjs" | "ws" | string | WebSocketServerConfiguration} [webSocketServer]
         * @property {ProxyConfigMap | ProxyConfigArray | ProxyArray} [proxy]
         * @property {boolean | string | Open | Array<string | Open>} [open]
         * @property {boolean} [setupExitSignals]
         * @property {boolean | ClientConfiguration} [client]
         * @property {Headers | ((req: Request, res: Response, context: DevMiddlewareContext<Request, Response>) => Headers)} [headers]
         * @property {(devServer: Server) => void} [onAfterSetupMiddleware]
         * @property {(devServer: Server) => void} [onBeforeSetupMiddleware]
         * @property {(devServer: Server) => void} [onListening]
         * @property {(middlewares: Middleware[], devServer: Server) => Middleware[]} [setupMiddlewares]
         */
        /**
         * @typedef {any} TODO
         */
        description: string;
        link: string;
      };
      ClientOverlay: {
        anyOf: (
          | {
              description: string;
              link: string;
              type: string;
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
                };
                warnings: {
                  description: string;
                  type: string;
                };
              };
              description?: undefined;
              link?: undefined;
            }
        )[];
      };
      ClientProgress: {
        description: string;
        link: string;
        type: string;
      };
      ClientReconnect: {
        description: string;
        link: string;
        anyOf: (
          | {
              type: string;
              minimum?: undefined;
            }
          | {
              type: string;
              minimum: number;
            }
        )[];
      };
      ClientWebSocketTransport: {
        anyOf: {
          $ref: string;
        }[];
        description: string;
        link: string;
      };
      ClientWebSocketTransportEnum: {
        enum: string[];
      };
      ClientWebSocketTransportString: {
        type: string;
        minLength: number;
      };
      ClientWebSocketURL: {
        description: string;
        link: string;
        anyOf: (
          | {
              /**
               * @typedef {HttpProxyMiddlewareOptions[]} ProxyArray
               */
              /**
               * @callback ByPass
               * @param {Request} req
               * @param {Response} res
               * @param {ProxyConfigArray} proxyConfig
               */
              /**
               * @typedef {{ path?: string | string[] | undefined, context?: string | string[] | HttpProxyMiddlewareOptionsFilter | undefined } & HttpProxyMiddlewareOptions & ByPass} ProxyConfigArray
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
               * @property {boolean | BonjourOptions} [bonjour]
               * @property {string | string[] | WatchFiles | Array<string | WatchFiles>} [watchFiles]
               * @property {boolean | string | Static | Array<string | Static>} [static]
               * @property {boolean | ServerOptions} [https]
               * @property {boolean} [http2]
               * @property {"http" | "https" | "spdy" | string | ServerConfiguration} [server]
               * @property {boolean | "sockjs" | "ws" | string | WebSocketServerConfiguration} [webSocketServer]
               * @property {ProxyConfigMap | ProxyConfigArray | ProxyArray} [proxy]
               * @property {boolean | string | Open | Array<string | Open>} [open]
               * @property {boolean} [setupExitSignals]
               * @property {boolean | ClientConfiguration} [client]
               * @property {Headers | ((req: Request, res: Response, context: DevMiddlewareContext<Request, Response>) => Headers)} [headers]
               * @property {(devServer: Server) => void} [onAfterSetupMiddleware]
               * @property {(devServer: Server) => void} [onBeforeSetupMiddleware]
               * @property {(devServer: Server) => void} [onListening]
               * @property {(middlewares: Middleware[], devServer: Server) => Middleware[]} [setupMiddlewares]
               */
              /**
               * @typedef {any} TODO
               */
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
      };
      HTTPS: {
        anyOf: (
          | {
              type: string;
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
                  /**
                   * @param {Configuration | Compiler | MultiCompiler} options
                   * @param {Compiler | MultiCompiler | Configuration} compiler
                   */
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
                        /** @type {Schema} */ items?: undefined;
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
      /**
       * @returns {string}
       */
      Headers: {
        anyOf: (
          | {
              type: string;
              items: {
                /**
                 * @type {string | undefined}
                 */
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
      HistoryApiFallback: {
        anyOf: (
          | {
              type: string;
              description?: undefined;
              link?: undefined;
            }
          | {
              type: string;
              description: string;
              link: string;
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
              enum?: undefined;
            }
          | {
              enum: string[];
              type?: undefined;
            }
        )[];
        description: string;
        link: string;
      };
      IPC: {
        anyOf: (
          | {
              type: string;
              /** @type {ClientConfiguration} */ minLength: number;
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
        link: string;
      };
      MagicHTML: {
        type: string;
        description: string;
        link: string;
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
                }
              | {
                  type: string;
                  minLength: number;
                  description: string;
                  additionalProperties?: undefined;
                  properties?: undefined;
                }
            )[];
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
        /** @type {any} */ additionalProperties: boolean;
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
              $ref?: undefined;
            }
          | {
              type: string;
              items?: undefined;
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
                  additionalProperties?: undefined;
                }
              | {
                  type: string;
                  additionalProperties: boolean;
                }
            )[];
            description: string;
            link: string;
          };
          watch: {
            anyOf: (
              | {
                  type: string;
                  description?: undefined;
                  link?: undefined;
                }
              | {
                  type: string;
                  description: string;
                  link: string;
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
                  items?: undefined;
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
              $ref?: undefined;
            }
          | {
              $ref: string;
              enum?: undefined;
            }
        )[];
        description: string;
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
  cli: {
    readonly getArguments: () => {
      "allowed-hosts": {
        configs: (
          | {
              type: string;
              multiple: boolean;
              description: string;
              path: string;
            }
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
              values: string[];
            }
        )[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "allowed-hosts-reset": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      bonjour: {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      client: {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
          values: boolean[];
        }[];
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
         * @property {WatchOptions & { aggregateTimeout?: number, ignored?: string | RegExp | string[], poll?: number | boolean }} [options]
         */
        /**
         * @typedef {Object} Static
         * @property {string} [directory]
         * @property {string | string[]} [publicPath]
         * @property {boolean | ServeIndexOptions} [serveIndex]
         * @property {ServeStaticOptions} [staticOptions]
         * @property {boolean | WatchOptions & { aggregateTimeout?: number, ignored?: string | RegExp | string[], poll?: number | boolean }} [watch]
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
         * @typedef {{ [url: string]: string | HttpProxyMiddlewareOptions }} ProxyConfigMap
         */
        /**
         * @typedef {HttpProxyMiddlewareOptions[]} ProxyArray
         */
        /**
         * @callback ByPass
         * @param {Request} req
         * @param {Response} res
         * @param {ProxyConfigArray} proxyConfig
         */
        /**
         * @typedef {{ path?: string | string[] | undefined, context?: string | string[] | HttpProxyMiddlewareOptionsFilter | undefined } & HttpProxyMiddlewareOptions & ByPass} ProxyConfigArray
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
         * @property {boolean | BonjourOptions} [bonjour]
         * @property {string | string[] | WatchFiles | Array<string | WatchFiles>} [watchFiles]
         * @property {boolean | string | Static | Array<string | Static>} [static]
         * @property {boolean | ServerOptions} [https]
         * @property {boolean} [http2]
         * @property {"http" | "https" | "spdy" | string | ServerConfiguration} [server]
         * @property {boolean | "sockjs" | "ws" | string | WebSocketServerConfiguration} [webSocketServer]
         * @property {ProxyConfigMap | ProxyConfigArray | ProxyArray} [proxy]
         * @property {boolean | string | Open | Array<string | Open>} [open]
         * @property {boolean} [setupExitSignals]
         * @property {boolean | ClientConfiguration} [client]
         * @property {Headers | ((req: Request, res: Response, context: DevMiddlewareContext<Request, Response>) => Headers)} [headers]
         * @property {(devServer: Server) => void} [onAfterSetupMiddleware]
         * @property {(devServer: Server) => void} [onBeforeSetupMiddleware]
         * @property {(devServer: Server) => void} [onListening]
         * @property {(middlewares: Middleware[], devServer: Server) => Middleware[]} [setupMiddlewares]
         */
        /**
         * @typedef {any} TODO
         */
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "client-logging": {
        configs: {
          type: string;
          values: string[];
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-overlay": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-overlay-errors": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-overlay-warnings": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-progress": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-reconnect": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-web-socket-transport": {
        configs: (
          | {
              type: string;
              values: string[];
              multiple: boolean;
              description: string;
              path: string;
            }
          | {
              type: string;
              multiple: boolean;
              description: string;
              path: string;
            }
        )[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-web-socket-url": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-web-socket-url-hostname": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-web-socket-url-password": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-web-socket-url-pathname": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-web-socket-url-port": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "client-web-socket-url-protocol": {
        configs: (
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
              values: string[];
            }
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
            }
        )[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "client-web-socket-url-username": {
        configs: {
          type: string;
          /**
           * @private
           * @type {{ name: string | symbol, listener: (...args: any[]) => void}[] }}
           */
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      compress: {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      /**
       * @param {string} URL
       * @returns {boolean}
       */
      "history-api-fallback": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      host: {
        configs: (
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
              values: string[];
            }
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
            }
        )[];
        description: string;
        /**
         * @param {"v4" | "v6"} family
         * @returns {Promise<string | undefined>}
         */
        simpleType: string;
        multiple: boolean;
      };
      hot: {
        configs: (
          | {
              type: string;
              multiple: boolean;
              description: string;
              path: string;
            }
          | {
              type: string;
              values: string[];
              multiple: boolean;
              description: string;
              path: string;
            }
        )[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        /**
         * @param {Host} hostname
         * @returns {Promise<string>}
         */
        multiple: boolean;
      };
      http2: {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      https: {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "https-ca": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "https-ca-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "https-cacert": {
        configs: {
          type: string;
          /**
           * @private
           * @param {Compiler} compiler
           */
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "https-cacert-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        /** @type {WebSocketURL} */ description: string;
        multiple: boolean;
        simpleType: string;
      };
      "https-cert": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        /** @type {ServerConfiguration} */ multiple: boolean;
      };
      "https-cert-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "https-crl": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "https-crl-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "https-key": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "https-key-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "https-passphrase": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "https-pfx": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "https-pfx-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "https-request-cert": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      ipc: {
        configs: (
          | {
              type: string;
              multiple: boolean;
              description: string;
              path: string;
            }
          | {
              type: string;
              values: boolean[];
              multiple: boolean;
              description: string;
              path: string;
            }
        )[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "live-reload": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "magic-html": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      open: {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "open-app": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "open-app-name": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "open-app-name-reset": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "open-reset": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "open-target": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "open-target-reset": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      port: {
        configs: (
          | {
              type: string;
              multiple: boolean;
              description: string;
              path: string;
            }
          | {
              type: string;
              values: string[];
              multiple: boolean;
              description: string;
              path: string;
            }
        )[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "server-options-ca": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-ca-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-cacert": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-cacert-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-cert": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-cert-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-crl": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-crl-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-key": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-key-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-passphrase": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-pfx": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-pfx-reset": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-options-request-cert": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      "server-type": {
        configs: {
          description: string;
          multiple: boolean;
          path: string;
          type: string;
          values: string[];
        }[];
        description: string;
        multiple: boolean;
        simpleType: string;
      };
      static: {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean /** @type {any} */;
      };
      /** @type {any} */
      "static-directory": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "static-public-path": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "static-public-path-reset": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "static-reset": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "static-serve-index": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "static-watch": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        negatedDescription: string;
        simpleType: string;
        multiple: boolean;
      };
      "watch-files": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "watch-files-reset": {
        configs: {
          type: string;
          multiple: boolean;
          description: string;
          path: string;
        }[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
      "web-socket-server": {
        configs: (
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
              values: boolean[];
            }
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
              values: string[];
            }
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
            }
        )[];
        description: string;
        simpleType: string;
        /** @type {ServerOptions} */ multiple: boolean;
      };
      "web-socket-server-type": {
        configs: (
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
              values: string[] /** @type {ServerOptions & { cacert?: ServerOptions["ca"] }} */;
            }
          | {
              description: string;
              multiple: boolean;
              path: string;
              type: string;
            }
        )[];
        description: string;
        simpleType: string;
        multiple: boolean;
      };
    };
    readonly processArguments: (
      args: Record<string, import("../bin/process-arguments").Argument>,
      config: any,
      values: Record<
        string,
        | string
        | number
        | boolean
        | RegExp
        | (string | number | boolean | RegExp)[]
      >
    ) => import("../bin/process-arguments").Problem[] | null;
  };
};
export = _exports;
export type Schema = import("schema-utils/declarations/validate").Schema;
export type Compiler = import("webpack").Compiler;
export type MultiCompiler = import("webpack").MultiCompiler;
export type WebpackConfiguration = import("webpack").Configuration;
export type StatsOptions = import("webpack").StatsOptions;
export type NetworkInterfaceInfo = import("os").NetworkInterfaceInfo;
export type StatsCompilation = import("webpack").StatsCompilation;
export type Stats = import("webpack").Stats;
export type MultiStats = import("webpack").MultiStats;
export type Request = import("express").Request;
export type Response = import("express").Response;
export type NextFunction = import("express").NextFunction;
export type ExpressRequestHandler = import("express").RequestHandler;
export type ExpressErrorRequestHandler = import("express").ErrorRequestHandler;
export type WatchOptions = import("chokidar").WatchOptions;
export type FSWatcher = import("chokidar").FSWatcher;
export type ConnectHistoryApiFallbackOptions =
  import("connect-history-api-fallback").Options;
export type Bonjour = import("bonjour").Bonjour;
export type BonjourOptions = import("bonjour").BonjourOptions;
export type RequestHandler = import("http-proxy-middleware").RequestHandler;
export type HttpProxyMiddlewareOptions =
  import("http-proxy-middleware").Options;
export type HttpProxyMiddlewareOptionsFilter =
  import("http-proxy-middleware").Filter;
export type ServeIndexOptions = import("serve-index").Options;
export type ServeStaticOptions = import("serve-static").ServeStaticOptions;
export type IPv4 = import("ipaddr.js").IPv4;
export type IPv6 = import("ipaddr.js").IPv6;
export type Socket = import("net").Socket;
export type IncomingMessage = import("http").IncomingMessage;
export type OpenOptions = import("open").Options;
export type ServerOptions = import("https").ServerOptions & {
  spdy?: {
    plain?: boolean | undefined;
    ssl?: boolean | undefined;
    "x-forwarded-for"?: string | undefined;
    protocol?: string | undefined;
    protocols?: string[] | undefined;
  };
};
export type DevMiddlewareOptions<Request_1, Response_1> =
  import("webpack-dev-middleware").Options<Request_1, Response_1>;
export type DevMiddlewareContext<Request_1, Response_1> =
  import("webpack-dev-middleware").Context<Request_1, Response_1>;
export type Host = "local-ip" | "local-ipv4" | "local-ipv6" | string;
export type Port = number | string | "auto";
export type WatchFiles = {
  paths: string | string[];
  options?:
    | (import("chokidar").WatchOptions & {
        aggregateTimeout?: number | undefined;
        ignored?: string | RegExp | string[] | undefined;
        poll?: number | boolean | undefined;
      })
    | undefined;
};
export type Static = {
  directory?: string | undefined;
  publicPath?: string | string[] | undefined;
  serveIndex?: boolean | import("serve-index").Options | undefined;
  staticOptions?:
    | import("serve-static").ServeStaticOptions<import("http").ServerResponse>
    | undefined;
  watch?:
    | boolean
    | (import("chokidar").WatchOptions & {
        aggregateTimeout?: number | undefined;
        ignored?: string | RegExp | string[] | undefined;
        poll?: number | boolean | undefined;
      })
    | undefined;
};
export type NormalizedStatic = {
  directory: string;
  publicPath: string[];
  serveIndex: false | ServeIndexOptions;
  staticOptions: ServeStaticOptions;
  watch: false | WatchOptions;
};
export type ServerConfiguration = {
  type?: string | undefined;
  options?: ServerOptions | undefined;
};
export type WebSocketServerConfiguration = {
  type?: string | Function | undefined;
  options?: Record<string, any> | undefined;
};
export type ClientConnection = (
  | import("ws").WebSocket
  | (import("sockjs").Connection & {
      send: import("ws").WebSocket["send"];
      terminate: import("ws").WebSocket["terminate"];
      ping: import("ws").WebSocket["ping"];
    })
) & {
  isAlive?: boolean;
};
export type WebSocketServer =
  | import("ws").WebSocketServer
  | (import("sockjs").Server & {
      close: import("ws").WebSocketServer["close"];
    });
export type WebSocketServerImplementation = {
  implementation: WebSocketServer;
  clients: ClientConnection[];
};
export type ProxyConfigMap = {
  [url: string]: string | import("http-proxy-middleware").Options;
};
export type ProxyArray = HttpProxyMiddlewareOptions[];
export type ByPass = (
  req: Request,
  res: Response,
  proxyConfig: ProxyConfigArray
) => any;
export type ProxyConfigArray = {
  path?: string | string[] | undefined;
  context?: string | string[] | HttpProxyMiddlewareOptionsFilter | undefined;
} & HttpProxyMiddlewareOptions &
  ByPass;
export type OpenApp = {
  name?: string | undefined;
  arguments?: string[] | undefined;
};
export type Open = {
  app?: string | string[] | OpenApp | undefined;
  target?: string | string[] | undefined;
};
export type NormalizedOpen = {
  target: string;
  options: import("open").Options;
};
export type WebSocketURL = {
  hostname?: string | undefined;
  password?: string | undefined;
  pathname?: string | undefined;
  port?: string | number | undefined;
  protocol?: string | undefined;
  username?: string | undefined;
};
export type ClientConfiguration = {
  logging?: "none" | "error" | "warn" | "info" | "log" | "verbose" | undefined;
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
export type Headers =
  | Array<{
      key: string;
      value: string;
    }>
  | Record<string, string | string[]>;
export type Middleware =
  | {
      name?: string;
      path?: string;
      middleware: ExpressRequestHandler | ExpressErrorRequestHandler;
    }
  | ExpressRequestHandler
  | ExpressErrorRequestHandler;
export type DevServerConfiguration = {
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
  bonjour?: boolean | import("bonjour").BonjourOptions | undefined;
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
  proxy?: ProxyConfigMap | ProxyConfigArray | ProxyArray | undefined;
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
export type TODO = any;
declare class Server {
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
   * @returns {Promise<number | string>}
   */
  static getFreePort(port: Port): Promise<number | string>;
  /**
   * @returns {string}
   */
  static findCacheDir(): string;
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
   * @private
   * @type {Socket[]}
   */
  private sockets;
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
   * @returns {any}
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
   * @type {import("bonjour").Bonjour | undefined}
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
  startCallback(
    callback?: ((err?: Error | undefined) => void) | undefined
  ): void;
  /**
   * @returns {Promise<void>}
   */
  stop(): Promise<void>;
  /**
   * @param {(err?: Error) => void} [callback]
   */
  stopCallback(
    callback?: ((err?: Error | undefined) => void) | undefined
  ): void;
  /**
   * @param {Port} port
   * @param {Host} hostname
   * @param {(err?: Error) => void} fn
   * @returns {void}
   */
  listen(
    port: Port,
    hostname: Host,
    fn: (err?: Error | undefined) => void
  ): void;
  /**
   * @param {(err?: Error) => void} [callback]
   * @returns {void}
   */
  close(callback?: ((err?: Error | undefined) => void) | undefined): void;
}
import path = require("path");
import express = require("express");

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
