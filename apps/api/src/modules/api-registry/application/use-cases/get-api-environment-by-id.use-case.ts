import { ApiEnvironment } from '../../domain/entities/api-environment.entity.js';
import { ApiEnvironmentNotFoundError } from '../errors/api-environment-not-found.error.js';
import { ApiEnvironmentRepository } from '../ports/api-environment.repository.js';

export class GetApiEnvironmentByIdUseCase {
  constructor(
    private readonly environmentRepository: ApiEnvironmentRepository,
  ) {}

  async execute(id: string): Promise<ApiEnvironment> {
    const environment = await this.environmentRepository.findById(id);
    if (!environment) throw new ApiEnvironmentNotFoundError(id);
    return environment;
  }
}
