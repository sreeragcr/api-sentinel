

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BadRequestException } from '@nestjs/common';
import { GraphQLError } from 'graphql';

import { ProjectResolver } from './project.resolver.js';

import {
  CreateProjectUseCase,
} from '../../application/use-cases/create-project.use-case.js';

import {
  Project,
  InvalidProjectError,
} from '../../domain/entities/project.entity.js';

import {
  ProjectSlugAlreadyExistsError,
} from '../../application/errors/project-slug-already-exists.error.js';

import {
  WorkspaceNotFoundError,
} from '../../application/errors/workspace-not-found.error.js';

describe('ProjectResolver', () => {
  const execute = vi.fn<CreateProjectUseCase['execute']>();

  const useCase = {
    execute,
  } as unknown as CreateProjectUseCase;

  let resolver: ProjectResolver;

  const input = {
    workspaceId: 'workspace-123',
    name: 'Backend API',
    description: 'Backend API testing project',
  };

  beforeEach(() => {
    execute.mockReset();

    resolver = new ProjectResolver(useCase);
  });

  describe('createProject()', () => {
    it('should create a project successfully', async () => {
      const project = Project.create({
        id: 'project-123',
        workspaceId: 'workspace-123',
        name: 'Backend API',
        slug: 'backend-api',
        description: 'Backend API testing project',
      });

      execute.mockResolvedValue(project);

      const result = await resolver.createProject(input);

      expect(execute).toHaveBeenCalledWith(input);
      expect(result).toBe(project);
    });

    it('should translate duplicate slug error into GraphQL conflict error', async () => {
      execute.mockRejectedValue(
        new ProjectSlugAlreadyExistsError(
          'workspace-123',
          'backend-api',
        ),
      );

      await expect(
        resolver.createProject(input),
      ).rejects.toMatchObject({
        message:
          'A project with slug "backend-api" already exists in workspace "workspace-123"',
        extensions: {
          code: 'CONFLICT',
        },
      });
    });

    it('should translate workspace not found error into GraphQL NOT_FOUND', async () => {
      execute.mockRejectedValue(
        new WorkspaceNotFoundError('workspace-123'),
      );

      await expect(
        resolver.createProject(input),
      ).rejects.toMatchObject({
        message: 'Workspace "workspace-123" does not exist',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should translate invalid project error into BadRequestException', async () => {
      execute.mockRejectedValue(
        new InvalidProjectError('Invalid project name'),
      );

      await expect(
        resolver.createProject(input),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should propagate unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');

      execute.mockRejectedValue(unexpectedError);

      await expect(
        resolver.createProject(input),
      ).rejects.toBe(unexpectedError);
    });
  });
});
