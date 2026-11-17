import { ApiEnvironmentNotFoundError } from '../errors/api-environment-not-found.error.js';
import { ApiEnvironmentRepository } from '../ports/api-environment.repository.js';

export class DeleteApiEnvironmentUseCase {
  constructor(
    private readonly environmentRepository: ApiEnvironmentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    if (!(await this.environmentRepository.findById(id))) {
      throw new ApiEnvironmentNotFoundError(id);
    }
    await this.environmentRepository.delete(id);
  }
}
