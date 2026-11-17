export class InvalidApiEnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidApiEnvironmentError';
  }
}
