
import { BadRequestException } from '@nestjs/common';

import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

import { CreateApiDefinitionUseCase } from '../../application/use-cases/create-api-definition.use-case.js';

import { GetApiDefinitionByIdUseCase } from '../../application/use-cases/get-api-definition-by-id.use-case.js';

import { GetApiDefinitionsByProjectUseCase } from '../../application/use-cases/get-api-definitions-by-project.use-case.js';

import { DuplicateApiDefinitionError } from '../../application/errors/duplicate-api-definition.error.js';

import { ProjectNotFoundError } from '../../application/errors/project-not-found.error.js';

import { ApiDefinitionNotFoundError } from '../../application/errors/api-definition-not-found.error.js';

import { InvalidApiDefinitionError } from '../../domain/entities/api-definition.entity.js';

import { CreateApiDefinitionInput } from './inputs/create-api-definition.input.js';

import { GetApiDefinitionsByProjectInput } from './inputs/get-api-definitions-by-project.input.js';

import { ApiDefinitionModel } from './models/api-definition.model.js';

import { ApiDefinitionListModel } from './models/api-definition-list.model.js';

@Resolver(() => ApiDefinitionModel)
export class ApiDefinitionResolver {
  constructor(
    private readonly createApiDefinitionUseCase: CreateApiDefinitionUseCase,

    private readonly getApiDefinitionByIdUseCase: GetApiDefinitionByIdUseCase,

    private readonly getApiDefinitionsByProjectUseCase: GetApiDefinitionsByProjectUseCase,
  ) {}

  @Mutation(() => ApiDefinitionModel)
  async createApiDefinition(
    @Args('input') input: CreateApiDefinitionInput,
  ): Promise<ApiDefinitionModel> {
    try {
      return await this.createApiDefinitionUseCase.execute(input);
    } catch (error: unknown) {
      if (error instanceof DuplicateApiDefinitionError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'CONFLICT' },
        });
      }

      if (error instanceof ProjectNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (error instanceof InvalidApiDefinitionError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Query(() => ApiDefinitionModel)
  async apiDefinition(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ApiDefinitionModel> {
    try {
      return await this.getApiDefinitionByIdUseCase.execute(id);
    } catch (error: unknown) {
      if (error instanceof ApiDefinitionNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      throw error;
    }
  }

  @Query(() => ApiDefinitionListModel)
  async apiDefinitionsByProject(
    @Args('input') input: GetApiDefinitionsByProjectInput,
  ): Promise<ApiDefinitionListModel> {
    try {
      return await this.getApiDefinitionsByProjectUseCase.execute(input);
    } catch (error: unknown) {
      if (error instanceof ProjectNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      throw error;
    }
  }
}
