import { ApiEnvironment } from '../../domain/entities/api-environment.entity.js';
import { ApiDefinitionNotFoundError } from '../errors/api-definition-not-found.error.js';
import { ApiDefinitionRepository } from '../ports/api-definition.repository.js';
import { ApiEnvironmentRepository } from '../ports/api-environment.repository.js';

export class GetApiEnvironmentsByApiDefinitionUseCase {
  constructor(
    private readonly environmentRepository: ApiEnvironmentRepository,
    private readonly apiDefinitionRepository: ApiDefinitionRepository,
  ) {}

  async execute(apiDefinitionId: string): Promise<ApiEnvironment[]> {
    const apiDefinition =
      await this.apiDefinitionRepository.findById(apiDefinitionId);
    if (!apiDefinition) throw new ApiDefinitionNotFoundError(apiDefinitionId);
    return this.environmentRepository.findByApiDefinitionId(apiDefinitionId);
  }
}
