
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaProjectRepository } from './prisma-project.repository.js';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { Project } from '../../domain/entities/project.entity.js';

import { ProjectSlugAlreadyExistsError } from '../../application/errors/project-slug-already-exists.error.js';

import { WorkspaceNotFoundError } from '../../application/errors/workspace-not-found.error.js';

describe('PrismaProjectRepository', () => {
  const create = vi.fn();
  const findUnique = vi.fn();
  const findMany = vi.fn();
  const count = vi.fn();

  const prisma = {
    project: {
      create,
      findUnique,
      findMany,
      count,
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
    findUnique.mockReset();
    findMany.mockReset();
    count.mockReset();

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

  describe('findById()', () => {
    it('should return a Project when the record exists', async () => {
      const project = createProject();

      findUnique.mockResolvedValue({
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });

      const result = await repository.findById(project.id);

      expect(findUnique).toHaveBeenCalledWith({
        where: {
          id: project.id,
        },
      });

      expect(result).toBeInstanceOf(Project);
      expect(result?.id).toBe(project.id);
      expect(result?.workspaceId).toBe(project.workspaceId);
      expect(result?.name).toBe(project.name);
      expect(result?.slug).toBe(project.slug);
    });

    it('should return null when the Project does not exist', async () => {
      findUnique.mockResolvedValue(null);

      const result = await repository.findById('missing-project');

      expect(result).toBeNull();

      expect(findUnique).toHaveBeenCalledWith({
        where: {
          id: 'missing-project',
        },
      });
    });
  });

  describe('findByWorkspaceId()', () => {
    it('should return paginated Projects and total count', async () => {
      const firstProject = createProject();

      const secondProject = Project.create({
        id: 'project-456',
        workspaceId: 'workspace-123',
        name: 'Frontend App',
        slug: 'frontend-app',
        description: null,
      });

      const toRecord = (project: Project) => ({
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        slug: project.slug,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });

      findMany.mockResolvedValue([
        toRecord(firstProject),
        toRecord(secondProject),
      ]);

      count.mockResolvedValue(25);

      const result = await repository.findByWorkspaceId(
        'workspace-123',
        {
          offset: 0,
          limit: 20,
        },
      );

      expect(findMany).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
        },
        skip: 0,
        take: 20,
        orderBy: [
          { createdAt: 'desc' },
          { id: 'desc' },
        ],
      });

      expect(count).toHaveBeenCalledWith({
        where: {
          workspaceId: 'workspace-123',
        },
      });

      expect(result.items).toHaveLength(2);
      expect(result.totalCount).toBe(25);

      expect(result.items[0]).toBeInstanceOf(Project);
      expect(result.items[1]).toBeInstanceOf(Project);

      expect(result.items[0].name).toBe('Backend API');
      expect(result.items[1].name).toBe('Frontend App');
    });

    it('should return an empty list when Workspace has no Projects', async () => {
      findMany.mockResolvedValue([]);
      count.mockResolvedValue(0);

      const result = await repository.findByWorkspaceId(
        'workspace-123',
        {
          offset: 0,
          limit: 20,
        },
      );

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });
});
