export interface HttpRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timeoutMs: number;
}

export interface HttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
}

export interface HttpClientPort {
  execute(request: HttpRequest): Promise<HttpResponse>;
}

export const HTTP_CLIENT = Symbol('HTTP_CLIENT');
