

import { BadRequestException } from '@nestjs/common';

import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case.js';

import { ProjectSlugAlreadyExistsError } from '../../application/errors/project-slug-already-exists.error.js';

import { WorkspaceNotFoundError } from '../../application/errors/workspace-not-found.error.js';

import { InvalidProjectError } from '../../domain/entities/project.entity.js';

import { CreateProjectInput } from './inputs/create-project.input.js';

import { ProjectModel } from './models/project.model.js';

@Resolver(() => ProjectModel)
export class ProjectResolver {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
  ) {}

  @Mutation(() => ProjectModel)
  async createProject(
    @Args('input') input: CreateProjectInput,
  ): Promise<ProjectModel> {
    try {
      return await this.createProjectUseCase.execute(input);
    } catch (error: unknown) {
      if (error instanceof ProjectSlugAlreadyExistsError) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'CONFLICT',
          },
        });
      }

      if (error instanceof WorkspaceNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      if (error instanceof InvalidProjectError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
