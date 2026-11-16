import { randomUUID } from 'node:crypto';

import {
  RestRequestConfiguration,
  QueryParameter,
  PathParameter,
  RequestHeader,
  AuthenticationConfig,
  RequestBody,
} from '../../domain/entities/rest-request-configuration.entity.js';

import {
  RestEndpointRepository,
} from '../ports/rest-endpoint.repository.js';

import {
  RestRequestConfigurationRepository,
} from '../ports/rest-request-configuration.repository.js';

import {
  RestEndpointNotFoundError,
} from '../errors/rest-endpoint-not-found.error.js';

interface CreateRestRequestConfigurationInput {
  endpointId: string;
  queryParameters?: QueryParameter[];
  pathParameters?: PathParameter[];
  headers?: RequestHeader[];
  authentication?: AuthenticationConfig;
  body?: RequestBody;
}

export class CreateRestRequestConfigurationUseCase {
  constructor(
    private readonly restRequestConfigurationRepository:
      RestRequestConfigurationRepository,
    private readonly restEndpointRepository:
      RestEndpointRepository,
  ) {}

  async execute(
    input: CreateRestRequestConfigurationInput,
  ): Promise<RestRequestConfiguration> {
    const endpoint = await this.restEndpointRepository.findById(
      input.endpointId,
    );

    if (!endpoint) {
      throw new RestEndpointNotFoundError(input.endpointId);
    }

    const configuration = RestRequestConfiguration.create({
      id: randomUUID(),
      endpointId: input.endpointId,
      queryParameters: input.queryParameters,
      pathParameters: input.pathParameters,
      headers: input.headers,
      authentication: input.authentication,
      body: input.body,
    });

    return this.restRequestConfigurationRepository.save(
      configuration,
    );
  }
}