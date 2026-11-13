
import {
  RestEndpointRepository,
} from '../ports/rest-endpoint.repository.js';

import {
  RestEndpointNotFoundError,
} from '../errors/rest-endpoint-not-found.error.js';

export class DeleteRestEndpointUseCase {
  constructor(
    private readonly restEndpointRepository: RestEndpointRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existingEndpoint =
      await this.restEndpointRepository.findById(id);

    if (!existingEndpoint) {
      throw new RestEndpointNotFoundError(id);
    }

    await this.restEndpointRepository.delete(id);
  }
}
