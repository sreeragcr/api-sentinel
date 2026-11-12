
import { randomUUID } from 'node:crypto';

import {
  ApiDefinition,
  InvalidApiDefinitionError,
} from '../../domain/entities/api-definition.entity.js';

import { ApiProtocol } from '../../domain/enums/api-protocol.enum.js';

import {
  ApiDefinitionRepository,
} from '../ports/api-definition.repository.js';

import {
  ProjectExistenceChecker,
} from '../ports/project-existence-checker.js';

import {
  ProjectNotFoundError,
} from '../errors/project-not-found.error.js';

import {
  DuplicateApiDefinitionError,
} from '../errors/duplicate-api-definition.error.js';

interface CreateApiDefinitionInput {
  projectId: string;
  name: string;
  description?: string;
  protocol: ApiProtocol;
}

export class CreateApiDefinitionUseCase {
  constructor(
    private readonly apiDefinitionRepository: ApiDefinitionRepository,
    private readonly projectExistenceChecker: ProjectExistenceChecker,
  ) {}

  async execute(
    input: CreateApiDefinitionInput,
  ): Promise<ApiDefinition> {
    const projectExists =
      await this.projectExistenceChecker.existsById(
        input.projectId,
      );

    if (!projectExists) {
      throw new ProjectNotFoundError(input.projectId);
    }

    const normalizedName = input.name.trim();

    const existingApiDefinition =
      await this.apiDefinitionRepository.findByProjectIdAndName(
        input.projectId,
        normalizedName,
      );

    if (existingApiDefinition) {
      throw new DuplicateApiDefinitionError(
        input.projectId,
        normalizedName,
      );
    }

    const apiDefinition = ApiDefinition.create({
      id: randomUUID(),
      projectId: input.projectId,
      name: input.name,
      description: input.description,
      protocol: input.protocol,
    });

    return this.apiDefinitionRepository.save(apiDefinition);
  }
}
