export class CredentialTypeMismatchError extends Error {
  constructor() {
    super('Credential type cannot be changed during an update');
    this.name = 'CredentialTypeMismatchError';
  }
}