export class DuplicateCredentialError extends Error {
  constructor(
    public readonly workspaceId: string,
    public readonly name: string,
  ) {
    super(`Credential "${name}" already exists in workspace "${workspaceId}"`);
    this.name = 'DuplicateCredentialError';
  }
}
