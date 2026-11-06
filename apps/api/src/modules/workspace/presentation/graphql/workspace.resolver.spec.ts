
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BadRequestException } from '@nestjs/common';
import { GraphQLError } from 'graphql';

import { WorkspaceResolver } from './workspace.resolver.js';

import { CreateWorkspaceUseCase } from '../../application/use-cases/create-workspace.use-case.js';

import { Workspace, InvalidWorkspaceError } from '../../domain/entities/workspace.entity.js';

import { WorkspaceSlugAlreadyExistsError } from '../../application/errors/workspace-slug-already-exists.error.js';

describe('WorkspaceResolver', () => {
  const execute = vi.fn<CreateWorkspaceUseCase['execute']>();

  const useCase = {
    execute,
  } as unknown as CreateWorkspaceUseCase;

  let resolver: WorkspaceResolver;

  const input = {
    name: 'API Sentinel',
    description: 'API testing platform',
  };

  beforeEach(() => {
    execute.mockReset();
    resolver = new WorkspaceResolver(useCase);
  });

  describe('createWorkspace()', () => {
    it('should create a workspace successfully', async () => {
      const workspace = Workspace.create({
        id: 'workspace-123',
        name: 'API Sentinel',
        slug: 'api-sentinel',
        description: 'API testing platform',
      });

      execute.mockResolvedValue(workspace);

      const result = await resolver.createWorkspace(input);

      expect(execute).toHaveBeenCalledWith(input);
      expect(result).toBe(workspace);
    });

    it('should translate duplicate slug error into GraphQL conflict error', async () => {
      execute.mockRejectedValue(
        new WorkspaceSlugAlreadyExistsError('api-sentinel'),
      );

      await expect(
        resolver.createWorkspace(input),
      ).rejects.toMatchObject({
        message: 'A workspace with slug "api-sentinel" already exists',
        extensions: {
          code: 'CONFLICT',
        },
      });
    });

    it('should translate invalid workspace error into BadRequestException', async () => {
      execute.mockRejectedValue(
        new InvalidWorkspaceError('Invalid workspace name'),
      );

      await expect(
        resolver.createWorkspace(input),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should propagate unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');

      execute.mockRejectedValue(unexpectedError);

      await expect(
        resolver.createWorkspace(input),
      ).rejects.toBe(unexpectedError);
    });
  });
});
