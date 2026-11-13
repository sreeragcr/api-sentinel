
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
  RestEndpointNotFoundError,
} from '../errors/rest-endpoint-not-found.error.js';

import {
  DuplicateRestEndpointError,
} from '../errors/duplicate-rest-endpoint.error.js';

interface UpdateRestEndpointInput {
  id: string;
  name: string;
  description?: string;
  method: HttpMethod;
  path: string;
}

export class UpdateRestEndpointUseCase {
  constructor(
    private readonly restEndpointRepository: RestEndpointRepository,
  ) {}

  async execute(
    input: UpdateRestEndpointInput,
  ): Promise<RestEndpoint> {
    const existingEndpoint =
      await this.restEndpointRepository.findById(input.id);

    if (!existingEndpoint) {
      throw new RestEndpointNotFoundError(input.id);
    }

    const normalizedPath = input.path.trim();

    const matchingEndpoint =
      await this.restEndpointRepository
        .findByApiDefinitionIdAndMethodAndPath(
          existingEndpoint.apiDefinitionId,
          input.method,
          normalizedPath,
        );

    if (
      matchingEndpoint &&
      matchingEndpoint.id !== existingEndpoint.id
    ) {
      throw new DuplicateRestEndpointError(
        existingEndpoint.apiDefinitionId,
        input.method,
        normalizedPath,
      );
    }

    const updatedEndpoint = existingEndpoint.update({
      name: input.name,
      description: input.description,
      method: input.method,
      path: normalizedPath,
    });

    return this.restEndpointRepository.update(updatedEndpoint);
  }
}
