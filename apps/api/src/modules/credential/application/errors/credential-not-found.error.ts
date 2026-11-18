export class CredentialNotFoundError extends Error {
  constructor(public readonly credentialId: string) {
    super(`Credential "${credentialId}" was not found`);
    this.name = 'CredentialNotFoundError';
  }
}
