
import { BadRequestException } from '@nestjs/common';

import {
  Args,
  Mutation,
  Resolver,
} from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

import {
  CreateRestEndpointUseCase,
} from '../../application/use-cases/create-rest-endpoint.use-case.js';

import {
  DuplicateRestEndpointError,
} from '../../application/errors/duplicate-rest-endpoint.error.js';

import {
  ApiDefinitionNotFoundError,
} from '../../application/errors/api-definition-not-found.error.js';

import {
  InvalidRestEndpointError,
} from '../../domain/entities/rest-endpoint.entity.js';

import {
  CreateRestEndpointInput,
} from './inputs/create-rest-endpoint.input.js';

import {
  RestEndpointModel,
} from './models/rest-endpoint.model.js';

@Resolver(() => RestEndpointModel)
export class RestEndpointResolver {
  constructor(
    private readonly createRestEndpointUseCase: CreateRestEndpointUseCase,
  ) {}

  @Mutation(() => RestEndpointModel)
  async createRestEndpoint(
    @Args('input') input: CreateRestEndpointInput,
  ): Promise<RestEndpointModel> {
    try {
      return await this.createRestEndpointUseCase.execute(input);
    } catch (error: unknown) {
      if (error instanceof DuplicateRestEndpointError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'CONFLICT' },
        });
      }

      if (error instanceof ApiDefinitionNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (error instanceof InvalidRestEndpointError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
