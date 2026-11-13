import {
  RestEndpointRepository,
  RestEndpointListResult,
} from '../ports/rest-endpoint.repository.js';

import {
  ApiDefinitionRepository,
} from '../ports/api-definition.repository.js';

import {
  ApiDefinitionNotFoundError,
} from '../errors/api-definition-not-found.error.js';

interface GetRestEndpointsByApiDefinitionInput {
  apiDefinitionId: string;
  offset: number;
  limit: number;
}

export class GetRestEndpointsByApiDefinitionUseCase {
  constructor(
    private readonly restEndpointRepository: RestEndpointRepository,
    private readonly apiDefinitionRepository: ApiDefinitionRepository,
  ) {}

  async execute(
    input: GetRestEndpointsByApiDefinitionInput,
  ): Promise<RestEndpointListResult> {
    const apiDefinition =
      await this.apiDefinitionRepository.findById(
        input.apiDefinitionId,
      );

    if (!apiDefinition) {
      throw new ApiDefinitionNotFoundError(
        input.apiDefinitionId,
      );
    }

    return this.restEndpointRepository.findByApiDefinitionId(
      input.apiDefinitionId,
      {
        offset: input.offset,
        limit: input.limit,
      },
    );
  }
}