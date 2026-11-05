// Workspace GraphQL resolver.

import { BadRequestException } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CreateWorkspaceUseCase } from '../../application/use-cases/create-workspace.use-case.js';

import { WorkspaceSlugAlreadyExistsError } from '../../application/errors/workspace-slug-already-exists.error.js';

import { InvalidWorkspaceError } from '../../domain/entities/workspace.entity.js';

import { CreateWorkspaceInput } from './inputs/create-workspace.input.js';

import { WorkspaceModel } from './models/workspace.model.js';

import { GraphQLError } from 'graphql';

@Resolver(() => WorkspaceModel)
export class WorkspaceResolver {
  constructor(
    private readonly createWorkspaceUseCase: CreateWorkspaceUseCase,
  ) { }

  @Mutation(() => WorkspaceModel)
  async createWorkspace(
    @Args('input') input: CreateWorkspaceInput,
  ): Promise<WorkspaceModel> {
    try {
      return await this.createWorkspaceUseCase.execute(input);
    } catch (error: unknown) {
      if (error instanceof WorkspaceSlugAlreadyExistsError) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'CONFLICT',
          },
        });
      }

      if (error instanceof InvalidWorkspaceError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}