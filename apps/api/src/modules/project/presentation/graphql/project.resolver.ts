
import { BadRequestException } from '@nestjs/common';

import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { GraphQLError } from 'graphql';

import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case.js';
import { GetProjectByIdUseCase } from '../../application/use-cases/get-project-by-id.use-case.js';
import { GetProjectsByWorkspaceUseCase } from '../../application/use-cases/get-projects-by-workspace.use-case.js';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case.js';
import { DeleteProjectUseCase } from '../../application/use-cases/delete-project.use-case.js';
import { RestoreProjectUseCase } from '../../application/use-cases/restore-project.use-case.js';

import { ProjectSlugAlreadyExistsError } from '../../application/errors/project-slug-already-exists.error.js';
import { ProjectNotFoundError } from '../../application/errors/project-not-found.error.js';
import { WorkspaceNotFoundError } from '../../application/errors/workspace-not-found.error.js';

import { InvalidProjectError } from '../../domain/entities/project.entity.js';

import { CreateProjectInput } from './inputs/create-project.input.js';
import { GetProjectsByWorkspaceInput } from './inputs/get-projects-by-workspace.input.js';
import { UpdateProjectInput } from './inputs/update-project.input.js';

import { ProjectModel } from './models/project.model.js';
import { ProjectListModel } from './models/project-list.model.js';

@Resolver(() => ProjectModel)
export class ProjectResolver {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly getProjectsByWorkspaceUseCase: GetProjectsByWorkspaceUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly restoreProjectUseCase: RestoreProjectUseCase,
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
          extensions: { code: 'CONFLICT' },
        });
      }

      if (error instanceof WorkspaceNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (error instanceof InvalidProjectError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Mutation(() => ProjectModel)
  async updateProject(
    @Args('input') input: UpdateProjectInput,
  ): Promise<ProjectModel> {
    try {
      return await this.updateProjectUseCase.execute(input);
    } catch (error: unknown) {
      if (error instanceof ProjectSlugAlreadyExistsError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'CONFLICT' },
        });
      }

      if (error instanceof ProjectNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (error instanceof InvalidProjectError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Mutation(() => ProjectModel)
  async deleteProject(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<ProjectModel> {
    try {
      return await this.deleteProjectUseCase.execute({ projectId });
    } catch (error: unknown) {
      if (error instanceof ProjectNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      throw error;
    }
  }

  @Mutation(() => ProjectModel)
  async restoreProject(
    @Args('projectId', { type: () => ID }) projectId: string,
  ): Promise<ProjectModel> {
    try {
      return await this.restoreProjectUseCase.execute({ projectId });
    } catch (error: unknown) {
      if (error instanceof ProjectNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      throw error;
    }
  }

  @Query(() => ProjectModel, { name: 'project' })
  async getProject(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProjectModel> {
    try {
      return await this.getProjectByIdUseCase.execute(id);
    } catch (error: unknown) {
      if (error instanceof ProjectNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      throw error;
    }
  }

  @Query(() => ProjectListModel, { name: 'projectsByWorkspace' })
  async getProjectsByWorkspace(
    @Args('input') input: GetProjectsByWorkspaceInput,
  ): Promise<ProjectListModel> {
    try {
      return await this.getProjectsByWorkspaceUseCase.execute(input);
    } catch (error: unknown) {
      if (error instanceof WorkspaceNotFoundError) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      throw error;
    }
  }
}
