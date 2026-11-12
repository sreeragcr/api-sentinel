
import { randomUUID } from 'node:crypto';

import {
  RestEndpoint,
} from '../../domain/entities/rest-endpoint.entity.js';

import {
  HttpMethod,
} from '../../domain/enums/http-method.enum.js';

import {
  RestEndpointRepository,
} from '../ports/rest-endpoint.repository.js';

import {
  ApiDefinitionRepository,
} from '../ports/api-definition.repository.js';

import {
  ApiDefinitionNotFoundError,
} from '../errors/api-definition-not-found.error.js';

import {
  DuplicateRestEndpointError,
} from '../errors/duplicate-rest-endpoint.error.js';

interface CreateRestEndpointInput {
  apiDefinitionId: string;
  name: string;
  description?: string;
  method: HttpMethod;
  path: string;
}

export class CreateRestEndpointUseCase {
  constructor(
    private readonly restEndpointRepository: RestEndpointRepository,
    private readonly apiDefinitionRepository: ApiDefinitionRepository,
  ) {}

  async execute(
    input: CreateRestEndpointInput,
  ): Promise<RestEndpoint> {
    const apiDefinition =
      await this.apiDefinitionRepository.findById(
        input.apiDefinitionId,
      );

    if (!apiDefinition) {
      throw new ApiDefinitionNotFoundError(
        input.apiDefinitionId,
      );
    }

    const normalizedPath = input.path.trim();

    const existingEndpoint =
      await this.restEndpointRepository
        .findByApiDefinitionIdAndMethodAndPath(
          input.apiDefinitionId,
          input.method,
          normalizedPath,
        );

    if (existingEndpoint) {
      throw new DuplicateRestEndpointError(
        input.apiDefinitionId,
        input.method,
        normalizedPath,
      );
    }

    const restEndpoint = RestEndpoint.create({
      id: randomUUID(),
      apiDefinitionId: input.apiDefinitionId,
      name: input.name,
      description: input.description,
      method: input.method,
      path: normalizedPath,
    });

    return this.restEndpointRepository.save(restEndpoint);
  }
}
