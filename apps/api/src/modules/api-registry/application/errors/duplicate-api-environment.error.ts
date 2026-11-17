export class DuplicateApiEnvironmentError extends Error {
  constructor(apiDefinitionId: string, name: string) {
    super(
      `An API environment named '${name}' already exists for API definition '${apiDefinitionId}'`,
    );
    this.name = 'DuplicateApiEnvironmentError';
  }
}
