
import { RestRequestConfiguration } from '../../domain/entities/rest-request-configuration.entity.js';

export const REST_REQUEST_CONFIGURATION_REPOSITORY = Symbol(
  'REST_REQUEST_CONFIGURATION_REPOSITORY',
);

export interface RestRequestConfigurationRepository {
  save(
    configuration: RestRequestConfiguration,
  ): Promise<RestRequestConfiguration>;

  findByEndpointId(
    endpointId: string,
  ): Promise<RestRequestConfiguration | null>;
}
