
export class ApiDefinitionNotFoundError extends Error {
  constructor(apiDefinitionId: string) {
    super(`API definition "${apiDefinitionId}" does not exist`);
    this.name = 'ApiDefinitionNotFoundError';
  }
}
