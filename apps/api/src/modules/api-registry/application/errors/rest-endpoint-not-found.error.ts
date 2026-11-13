
export class RestEndpointNotFoundError extends Error {
  constructor(id: string) {
    super(`REST endpoint with ID "${id}" was not found`);
    this.name = 'RestEndpointNotFoundError';
  }
}
