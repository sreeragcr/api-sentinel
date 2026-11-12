
export class DuplicateRestEndpointError extends Error {
  constructor(
    apiDefinitionId: string,
    method: string,
    path: string,
  ) {
    super(
      `A REST endpoint with method "${method}" and path "${path}" already exists in API definition "${apiDefinitionId}"`,
    );
    this.name = 'DuplicateRestEndpointError';
  }
}
