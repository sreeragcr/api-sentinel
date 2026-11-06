
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaWorkspaceRepository } from './prisma-workspace.repository.js';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { Workspace } from '../../domain/entities/workspace.entity.js';

import { WorkspaceSlugAlreadyExistsError } from '../../application/errors/workspace-slug-already-exists.error.js';

describe('PrismaWorkspaceRepository', () => {
  const create = vi.fn();

  const prisma = {
    workspace: {
      create,
    },
  } as unknown as PrismaService;

  let repository: PrismaWorkspaceRepository;

  const createWorkspace = () =>
    Workspace.create({
      id: 'workspace-123',
      name: 'API Sentinel',
      slug: 'api-sentinel',
      description: 'API testing platform',
    });

  beforeEach(() => {
    create.mockReset();
    repository = new PrismaWorkspaceRepository(prisma);
  });

  describe('save()', () => {
    it('should persist workspace using Prisma', async () => {
      const workspace = createWorkspace();

      create.mockResolvedValue({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      });

      await repository.save(workspace);

      expect(create).toHaveBeenCalledWith({
        data: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          description: workspace.description,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      });
    });

    it('should return a reconstructed Workspace entity', async () => {
      const workspace = createWorkspace();

      create.mockResolvedValue({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      });

      const result = await repository.save(workspace);

      expect(result).toBeInstanceOf(Workspace);
      expect(result.id).toBe(workspace.id);
      expect(result.name).toBe(workspace.name);
      expect(result.slug).toBe(workspace.slug);
      expect(result.description).toBe(workspace.description);
    });

    it('should translate Prisma P2002 error into duplicate slug error', async () => {
      const workspace = createWorkspace();

      create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(
        repository.save(workspace),
      ).rejects.toBeInstanceOf(
        WorkspaceSlugAlreadyExistsError,
      );
    });

    it('should propagate unexpected database errors', async () => {
      const workspace = createWorkspace();
      const databaseError = new Error('Database unavailable');

      create.mockRejectedValue(databaseError);

      await expect(
        repository.save(workspace),
      ).rejects.toBe(databaseError);
    });
  });
});
