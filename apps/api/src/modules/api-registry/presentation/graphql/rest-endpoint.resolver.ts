
import { BadRequestException } from '@nestjs/common';

import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

import {
  CreateRestEndpointUseCase,
} from '../../application/use-cases/create-rest-endpoint.use-case.js';

import {
  GetRestEndpointByIdUseCase,
} from '../../application/use-cases/get-rest-endpoint-by-id.use-case.js';

import {
  GetRestEndpointsByApiDefinitionUseCase,
} from '../../application/use-cases/get-rest-endpoints-by-api-definition.use-case.js';

import {
  UpdateRestEndpointUseCase,
} from '../../application/use-cases/update-rest-endpoint.use-case.js';

import {
  DuplicateRestEndpointError,
} from '../../application/errors/duplicate-rest-endpoint.error.js';

import {
  ApiDefinitionNotFoundError,
} from '../../application/errors/api-definition-not-found.error.js';

import {
  RestEndpointNotFoundError,
} from '../../application/errors/rest-endpoint-not-found.error.js';

import {
  InvalidRestEndpointError,
} from '../../domain/entities/rest-endpoint.entity.js';

import {
  CreateRestEndpointInput,
} from './inputs/create-rest-endpoint.input.js';

import {
  UpdateRestEndpointInput,
} from './inputs/update-rest-endpoint.input.js';

import {
  GetRestEndpointsByApiDefinitionInput,
} from './inputs/get-rest-endpoints-by-api-definition.input.js';

import {
  RestEndpointModel,
} from './models/rest-endpoint.model.js';

import {
  RestEndpointListModel,
} from './models/rest-endpoint-list.model.js';

@Resolver(() => RestEndpointModel)
export class RestEndpointResolver {
  constructor(
    private readonly createRestEndpointUseCase: CreateRestEndpointUseCase,
    private readonly getRestEndpointByIdUseCase: GetRestEndpointByIdUseCase,
    private readonly getRestEndpointsByApiDefinitionUseCase: GetRestEndpointsByApiDefinitionUseCase,
    private readonly updateRestEndpointUseCase: UpdateRestEndpointUseCase,
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

  @Mutation(() => RestEndpointModel)
  async updateRestEndpoint(
    @Args('input') input: UpdateRestEndpointInput,
  ): Promise<RestEndpointModel> {
    try {
      return await this.updateRestEndpointUseCase.execute(input);
    } catch (error: unknown) {
      if (error instanceof DuplicateRestEndpointError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'CONFLICT' },
        });
      }

      if (error instanceof RestEndpointNotFoundError) {
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

  @Query(() => RestEndpointModel)
  async restEndpoint(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<RestEndpointModel> {
    try {
      return await this.getRestEndpointByIdUseCase.execute(id);
    } catch (error: unknown) {
      if (error instanceof RestEndpointNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      throw error;
    }
  }

  @Query(() => RestEndpointListModel)
  async restEndpointsByApiDefinition(
    @Args('input') input: GetRestEndpointsByApiDefinitionInput,
  ): Promise<RestEndpointListModel> {
    try {
      return await this.getRestEndpointsByApiDefinitionUseCase.execute(
        input,
      );
    } catch (error: unknown) {
      if (error instanceof ApiDefinitionNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      throw error;
    }
  }
}
