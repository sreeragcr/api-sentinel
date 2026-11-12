
import { ApiDefinition } from '../../domain/entities/api-definition.entity.js';

import { ApiDefinitionRepository } from '../ports/api-definition.repository.js';

import { ApiDefinitionNotFoundError } from '../errors/api-definition-not-found.error.js';

export class GetApiDefinitionByIdUseCase {
  constructor(
    private readonly apiDefinitionRepository: ApiDefinitionRepository,
  ) {}

  async execute(apiDefinitionId: string): Promise<ApiDefinition> {
    const apiDefinition =
      await this.apiDefinitionRepository.findById(apiDefinitionId);

    if (!apiDefinition) {
      throw new ApiDefinitionNotFoundError(apiDefinitionId);
    }

    return apiDefinition;
  }
}
