import { ApiEnvironment } from '../../domain/entities/api-environment.entity.js';
import { ApiEnvironmentNotFoundError } from '../errors/api-environment-not-found.error.js';
import { DuplicateApiEnvironmentError } from '../errors/duplicate-api-environment.error.js';
import { ApiEnvironmentRepository } from '../ports/api-environment.repository.js';

export interface UpdateApiEnvironmentInput {
  id: string;
  name: string;
  baseUrl: string;
  description?: string;
}

export class UpdateApiEnvironmentUseCase {
  constructor(
    private readonly environmentRepository: ApiEnvironmentRepository,
  ) {}

  async execute(input: UpdateApiEnvironmentInput): Promise<ApiEnvironment> {
    const existing = await this.environmentRepository.findById(input.id);
    if (!existing) throw new ApiEnvironmentNotFoundError(input.id);

    const name = input.name.trim();
    const matching =
      await this.environmentRepository.findByApiDefinitionIdAndName(
        existing.apiDefinitionId,
        name,
      );
    if (matching && matching.id !== existing.id) {
      throw new DuplicateApiEnvironmentError(existing.apiDefinitionId, name);
    }
    return this.environmentRepository.update(
      existing.update({
        name,
        baseUrl: input.baseUrl,
        description: input.description,
      }),
    );
  }
}
