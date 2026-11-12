
import { RestEndpoint } from '../../domain/entities/rest-endpoint.entity.js';
import { HttpMethod } from '../../domain/enums/http-method.enum.js';

export const REST_ENDPOINT_REPOSITORY = Symbol(
  'REST_ENDPOINT_REPOSITORY',
);

export interface RestEndpointRepository {
  save(restEndpoint: RestEndpoint): Promise<RestEndpoint>;

  findById(id: string): Promise<RestEndpoint | null>;

  findByApiDefinitionIdAndMethodAndPath(
    apiDefinitionId: string,
    method: HttpMethod,
    path: string,
  ): Promise<RestEndpoint | null>;
}
