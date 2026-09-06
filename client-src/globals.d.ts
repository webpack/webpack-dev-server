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

declare module "webpack-dev-middleware/client/overlay" {
  export default function configureOverlay(options: {
    trustedTypesPolicyName?: string;
    openEditorEndpoint?: string;
    paginate?: boolean;
    catchRuntimeError?: boolean | ((error: Error) => boolean);
  }): {
    showProblems(
      type: "errors" | "warnings",
      lines: string[],
      source?: string,
    ): void;
    clear(source?: string): void;
  };
}

declare module "webpack-dev-middleware/client/indicator" {
  export function show(text?: string, percent?: number, source?: string): void;
  export function hide(source?: string): void;
}
