import { BadRequestException } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { ApiEnvironmentNotFoundError } from '../../application/errors/api-environment-not-found.error.js';
import { ApiDefinitionNotFoundError } from '../../application/errors/api-definition-not-found.error.js';
import { DuplicateApiEnvironmentError } from '../../application/errors/duplicate-api-environment.error.js';
import { CreateApiEnvironmentUseCase } from '../../application/use-cases/create-api-environment.use-case.js';
import { DeleteApiEnvironmentUseCase } from '../../application/use-cases/delete-api-environment.use-case.js';
import { GetApiEnvironmentByIdUseCase } from '../../application/use-cases/get-api-environment-by-id.use-case.js';
import { GetApiEnvironmentsByApiDefinitionUseCase } from '../../application/use-cases/get-api-environments-by-api-definition.use-case.js';
import { UpdateApiEnvironmentUseCase } from '../../application/use-cases/update-api-environment.use-case.js';
import { InvalidApiEnvironmentError } from '../../domain/errors/invalid-api-environment.error.js';
import { CreateApiEnvironmentInput } from './inputs/create-api-environment.input.js';
import { UpdateApiEnvironmentInput } from './inputs/update-api-environment.input.js';
import { ApiEnvironmentModel } from './models/api-environment.model.js';

@Resolver(() => ApiEnvironmentModel)
export class ApiEnvironmentResolver {
  constructor(
    private readonly createUseCase: CreateApiEnvironmentUseCase,
    private readonly getByIdUseCase: GetApiEnvironmentByIdUseCase,
    private readonly getByApiDefinitionUseCase: GetApiEnvironmentsByApiDefinitionUseCase,
    private readonly updateUseCase: UpdateApiEnvironmentUseCase,
    private readonly deleteUseCase: DeleteApiEnvironmentUseCase,
  ) {}

  @Mutation(() => ApiEnvironmentModel)
  async createApiEnvironment(
    @Args('input') input: CreateApiEnvironmentInput,
  ): Promise<ApiEnvironmentModel> {
    return this.execute(() => this.createUseCase.execute(input));
  }

  @Mutation(() => ApiEnvironmentModel)
  async updateApiEnvironment(
    @Args('input') input: UpdateApiEnvironmentInput,
  ): Promise<ApiEnvironmentModel> {
    return this.execute(() => this.updateUseCase.execute(input));
  }

  @Mutation(() => Boolean)
  async deleteApiEnvironment(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.execute(() => this.deleteUseCase.execute(id));
    return true;
  }

  @Query(() => ApiEnvironmentModel)
  async apiEnvironment(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ApiEnvironmentModel> {
    return this.execute(() => this.getByIdUseCase.execute(id));
  }

  @Query(() => [ApiEnvironmentModel])
  async apiEnvironmentsByApiDefinition(
    @Args('apiDefinitionId', { type: () => ID }) apiDefinitionId: string,
  ): Promise<ApiEnvironmentModel[]> {
    return this.execute(() =>
      this.getByApiDefinitionUseCase.execute(apiDefinitionId),
    );
  }

  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (error instanceof DuplicateApiEnvironmentError)
        throw new GraphQLError(error.message, {
          extensions: { code: 'CONFLICT' },
        });
      if (
        error instanceof ApiEnvironmentNotFoundError ||
        error instanceof ApiDefinitionNotFoundError
      )
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      if (error instanceof InvalidApiEnvironmentError)
        throw new BadRequestException(error.message);
      throw error;
    }
  }
}
