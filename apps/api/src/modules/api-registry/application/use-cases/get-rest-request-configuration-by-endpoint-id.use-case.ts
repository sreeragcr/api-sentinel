import {
  RestRequestConfiguration,
} from '../../domain/entities/rest-request-configuration.entity.js';

import {
  RestRequestConfigurationRepository,
} from '../ports/rest-request-configuration.repository.js';

export class GetRestRequestConfigurationByEndpointIdUseCase {
  constructor(
    private readonly restRequestConfigurationRepository:
      RestRequestConfigurationRepository,
  ) {}

  async execute(
    endpointId: string,
  ): Promise<RestRequestConfiguration | null> {
    return this.restRequestConfigurationRepository.findByEndpointId(
      endpointId,
    );
  }
}