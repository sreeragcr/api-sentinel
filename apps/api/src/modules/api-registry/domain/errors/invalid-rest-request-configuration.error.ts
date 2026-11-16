export class InvalidRestRequestConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRestRequestConfigurationError';
  }
}