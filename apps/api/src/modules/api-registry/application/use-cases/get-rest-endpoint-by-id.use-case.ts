
import {
  RestEndpoint,
} from '../../domain/entities/rest-endpoint.entity.js';

import {
  RestEndpointRepository,
} from '../ports/rest-endpoint.repository.js';

import {
  RestEndpointNotFoundError,
} from '../errors/rest-endpoint-not-found.error.js';

export class GetRestEndpointByIdUseCase {
  constructor(
    private readonly restEndpointRepository: RestEndpointRepository,
  ) {}

  async execute(restEndpointId: string): Promise<RestEndpoint> {
    const restEndpoint =
      await this.restEndpointRepository.findById(restEndpointId);

    if (!restEndpoint) {
      throw new RestEndpointNotFoundError(restEndpointId);
    }

    return restEndpoint;
  }
}
