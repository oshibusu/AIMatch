/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: (request: Request) => Promise<Response> | Response;
    onError?: (error: unknown) => Promise<Response> | Response;
  }

  export type Handler = (request: Request) => Promise<Response> | Response;

  export interface Request extends globalThis.Request {
    body: any;
  }

  export interface Response extends globalThis.Response {
    new(body?: BodyInit | null, init?: ResponseInit): Response;
  }

  export function serve(handler: Handler | ServeInit): Promise<void>;
}

export interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface AIClient {
  createChatCompletion(messages: Array<{ role: string; content: string }>): Promise<AIResponse>;
}