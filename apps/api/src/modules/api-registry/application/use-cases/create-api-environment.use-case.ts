import { randomUUID } from 'node:crypto';

import { ApiEnvironment } from '../../domain/entities/api-environment.entity.js';
import { ApiDefinitionNotFoundError } from '../errors/api-definition-not-found.error.js';
import { DuplicateApiEnvironmentError } from '../errors/duplicate-api-environment.error.js';
import { ApiDefinitionRepository } from '../ports/api-definition.repository.js';
import { ApiEnvironmentRepository } from '../ports/api-environment.repository.js';

export interface CreateApiEnvironmentInput {
  apiDefinitionId: string;
  name: string;
  baseUrl: string;
  description?: string;
}

export class CreateApiEnvironmentUseCase {
  constructor(
    private readonly environmentRepository: ApiEnvironmentRepository,
    private readonly apiDefinitionRepository: ApiDefinitionRepository,
  ) {}

  async execute(input: CreateApiEnvironmentInput): Promise<ApiEnvironment> {
    const apiDefinition = await this.apiDefinitionRepository.findById(
      input.apiDefinitionId,
    );
    if (!apiDefinition)
      throw new ApiDefinitionNotFoundError(input.apiDefinitionId);

    const name = input.name.trim();
    const existing =
      await this.environmentRepository.findByApiDefinitionIdAndName(
        input.apiDefinitionId,
        name,
      );
    if (existing)
      throw new DuplicateApiEnvironmentError(input.apiDefinitionId, name);

    return this.environmentRepository.save(
      ApiEnvironment.create({
        id: randomUUID(),
        apiDefinitionId: input.apiDefinitionId,
        name,
        baseUrl: input.baseUrl,
        description: input.description,
      }),
    );
  }
}
