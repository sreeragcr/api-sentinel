
import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import {
  AuthenticationConfig,
  RequestBody,
  RestRequestConfiguration,
} from '../../domain/entities/rest-request-configuration.entity.js';

import { AuthenticationType } from '../../domain/enums/authentication-type.enum.js';
import { RequestBodyType } from '../../domain/enums/request-body-type.enum.js';

import { RestEndpointNotFoundError } from '../../application/errors/rest-endpoint-not-found.error.js';

import { CreateRestRequestConfigurationUseCase } from '../../application/use-cases/create-rest-request-configuration.use-case.js';
import { GetRestRequestConfigurationByEndpointIdUseCase } from '../../application/use-cases/get-rest-request-configuration-by-endpoint-id.use-case.js';

import {
  AuthenticationConfigInput,
  CreateRestRequestConfigurationInput,
  RequestBodyInput,
} from './inputs/rest-request-configuration.input.js';

import {
  RestRequestConfigurationModel,
} from './models/rest-request-configuration.model.js';

import { InvalidRestRequestConfigurationError } from '../../domain/errors/invalid-rest-request-configuration.error.js';

function mapAuthentication(
  input?: AuthenticationConfigInput,
): AuthenticationConfig {
  if (!input) {
    return { type: AuthenticationType.NONE };
  }

  switch (input.type) {
    case AuthenticationType.NONE:
      return { type: AuthenticationType.NONE };

    case AuthenticationType.BEARER:
    case AuthenticationType.BASIC:
      if (!input.credentialReference?.trim()) {
        throw new GraphQLError(
          'A credential reference is required for this authentication type',
          { extensions: { code: 'BAD_USER_INPUT' } },
        );
      }

      return {
        type: input.type,
        credentialReference: input.credentialReference,
      };

    case AuthenticationType.API_KEY:
      if (
        !input.keyName?.trim() ||
        !input.location ||
        !input.credentialReference?.trim()
      ) {
        throw new GraphQLError(
          'API key authentication requires keyName, location, and credentialReference',
          { extensions: { code: 'BAD_USER_INPUT' } },
        );
      }

      return {
        type: AuthenticationType.API_KEY,
        keyName: input.keyName,
        location: input.location,
        credentialReference: input.credentialReference,
      };

    default:
      throw new GraphQLError(
        'Invalid authentication type',
        { extensions: { code: 'BAD_USER_INPUT' } },
      );
  }
}

function mapRequestBody(input?: RequestBodyInput): RequestBody {
  if (!input) {
    return { type: RequestBodyType.NONE };
  }

  switch (input.type) {
    case RequestBodyType.NONE:
      return { type: RequestBodyType.NONE };

    case RequestBodyType.JSON:
      if (input.content === undefined) {
        throw new GraphQLError(
          'JSON body content is required',
          { extensions: { code: 'BAD_USER_INPUT' } },
        );
      }

      return {
        type: RequestBodyType.JSON,
        content: input.content,
      };

    case RequestBodyType.FORM_URLENCODED:
    case RequestBodyType.MULTIPART:
      return {
        type: input.type,
        fields: input.fields ?? [],
      };

    case RequestBodyType.RAW_TEXT:
      if (input.content === undefined) {
        throw new GraphQLError(
          'Raw text body content is required',
          { extensions: { code: 'BAD_USER_INPUT' } },
        );
      }

      return {
        type: RequestBodyType.RAW_TEXT,
        content: input.content,
        ...(input.contentType !== undefined
          ? { contentType: input.contentType }
          : {}),
      };

    default:
      throw new GraphQLError(
        'Invalid request body type',
        { extensions: { code: 'BAD_USER_INPUT' } },
      );
  }
}

@Resolver(() => RestRequestConfigurationModel)
export class RestRequestConfigurationResolver {
  constructor(
    private readonly createRestRequestConfigurationUseCase:
      CreateRestRequestConfigurationUseCase,
    private readonly getRestRequestConfigurationByEndpointIdUseCase:
      GetRestRequestConfigurationByEndpointIdUseCase,
  ) {}

  @Mutation(() => RestRequestConfigurationModel)
  async createRestRequestConfiguration(
    @Args('input') input: CreateRestRequestConfigurationInput,
  ): Promise<RestRequestConfiguration> {
    try {
      return await this.createRestRequestConfigurationUseCase.execute({
        endpointId: input.endpointId,
        queryParameters: input.queryParameters,
        pathParameters: input.pathParameters,
        headers: input.headers,
        authentication: mapAuthentication(input.authentication),
        body: mapRequestBody(input.body),
      });
    } catch (error: unknown) {
      if (error instanceof RestEndpointNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (error instanceof InvalidRestRequestConfigurationError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      throw error;
    }
  }

  @Query(() => RestRequestConfigurationModel, { nullable: true })
  async restRequestConfiguration(
    @Args('endpointId', { type: () => ID }) endpointId: string,
  ): Promise<RestRequestConfiguration | null> {
    return this.getRestRequestConfigurationByEndpointIdUseCase.execute(
      endpointId,
    );
  }
}
