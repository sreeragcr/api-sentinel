
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaProjectRepository } from './prisma-project.repository.js';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { Project } from '../../domain/entities/project.entity.js';

import { ProjectSlugAlreadyExistsError } from '../../application/errors/project-slug-already-exists.error.js';

import { WorkspaceNotFoundError } from '../../application/errors/workspace-not-found.error.js';

describe('PrismaProjectRepository', () => {
  const create = vi.fn();

  const prisma = {
    project: {
      create,
    },
  } as unknown as PrismaService;

  let repository: PrismaProjectRepository;

  const createProject = () =>
    Project.create({
      id: 'project-123',
      workspaceId: 'workspace-123',
      name: 'Backend API',
      slug: 'backend-api',
      description: 'Backend API testing project',
    });

  beforeEach(() => {
    create.mockReset();
    repository = new PrismaProjectRepository(prisma);
  });

  describe('save()', () => {
    it('should persist project using Prisma', async () => {
      const project = createProject();

      create.mockResolvedValue({
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });

      await repository.save(project);

      expect(create).toHaveBeenCalledWith({
        data: {
          id: project.id,
          workspaceId: project.workspaceId,
          name: project.name,
          slug: project.slug,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      });
    });

    it('should return a reconstructed Project entity', async () => {
      const project = createProject();

      create.mockResolvedValue({
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });

      const result = await repository.save(project);

      expect(result).toBeInstanceOf(Project);
      expect(result.id).toBe(project.id);
      expect(result.workspaceId).toBe(project.workspaceId);
      expect(result.name).toBe(project.name);
      expect(result.slug).toBe(project.slug);
      expect(result.description).toBe(project.description);
    });

    it('should translate Prisma P2002 error into duplicate slug error', async () => {
      const project = createProject();

      create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(
        repository.save(project),
      ).rejects.toBeInstanceOf(ProjectSlugAlreadyExistsError);
    });

    it('should translate Prisma P2003 error into workspace not found error', async () => {
      const project = createProject();

      create.mockRejectedValue({
        code: 'P2003',
      });

      await expect(
        repository.save(project),
      ).rejects.toBeInstanceOf(WorkspaceNotFoundError);
    });

    it('should propagate unexpected database errors', async () => {
      const project = createProject();

      const databaseError = new Error('Database unavailable');

      create.mockRejectedValue(databaseError);

      await expect(
        repository.save(project),
      ).rejects.toBe(databaseError);
    });
  });
});
