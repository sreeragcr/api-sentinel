export class ApiEnvironmentNotFoundError extends Error {
  constructor(id: string) {
    super(`API environment with ID '${id}' was not found`);
    this.name = 'ApiEnvironmentNotFoundError';
  }
}
