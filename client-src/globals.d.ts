declare interface CommunicationClient {
  onOpen(fn: (...args: any[]) => void): void;
  onClose(fn: (...args: any[]) => void): void;
  onMessage(fn: (...args: any[]) => void): void;
}

declare interface CommunicationClientConstructor {
  new (url: string): CommunicationClient; // Defines a constructor that takes a string and returns a GreeterInstance
}

declare const __webpack_dev_server_client__:
  | CommunicationClientConstructor
  | { default: CommunicationClientConstructor }
  | undefined;

declare module "ansi-html-community" {
  function ansiHtmlCommunity(str: string): string;

  namespace ansiHtmlCommunity {
    function setColors(colors: Record<string, string | string[]>): void;
  }

  export = ansiHtmlCommunity;
}
