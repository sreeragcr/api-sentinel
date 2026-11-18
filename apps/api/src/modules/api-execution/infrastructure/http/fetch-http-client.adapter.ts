import {
  HttpClientPort,
  HttpRequest,
  HttpResponse,
} from '../../application/ports/http-client.port.js';

export class FetchHttpClientAdapter implements HttpClientPort {
  async execute(request: HttpRequest): Promise<HttpResponse> {
    const controller = new AbortController();
    const startTime = performance.now();

    const timeout = setTimeout(
      () => controller.abort(),
      request.timeoutMs,
    );

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
      });

      const body = await response.text();
      const durationMs = Math.round(performance.now() - startTime);

      const headers: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        statusCode: response.status,
        headers,
        body,
        durationMs,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
