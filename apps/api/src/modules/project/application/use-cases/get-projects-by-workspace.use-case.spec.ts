
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetProjectsByWorkspaceUseCase } from './get-projects-by-workspace.use-case.js';

import { Project } from '../../domain/entities/project.entity.js';

import type { ProjectRepository } from '../ports/project.repository.js';

import type {
  WorkspaceExistenceChecker,
} from '../ports/workspace-existence-checker.js';

import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';

describe('GetProjectsByWorkspaceUseCase', () => {
  const save = vi.fn<ProjectRepository['save']>();
  const findById = vi.fn<ProjectRepository['findById']>();

  const findByWorkspaceId =
    vi.fn<ProjectRepository['findByWorkspaceId']>();

  const findDeletedByWorkspaceId =
    vi.fn<ProjectRepository['findDeletedByWorkspaceId']>();

  const deleteById = vi.fn<ProjectRepository['deleteById']>();

  const existsById =
    vi.fn<WorkspaceExistenceChecker['existsById']>();

  const update = vi.fn<ProjectRepository['update']>();

  const projectRepository: ProjectRepository = {
    save,
    update,
    findById,
    findByWorkspaceId,
    findDeletedByWorkspaceId,
    deleteById,
  };

  const workspaceExistenceChecker: WorkspaceExistenceChecker = {
    existsById,
  };

  let useCase: GetProjectsByWorkspaceUseCase;

  const createProject = (
    id: string,
    name: string,
    slug: string,
  ) =>
    Project.create({
      id,
      workspaceId: 'workspace-123',
      name,
      slug,
    });

  beforeEach(() => {
    save.mockReset();
    update.mockReset();
    findById.mockReset();
    findByWorkspaceId.mockReset();
    existsById.mockReset();

    existsById.mockResolvedValue(true);

    findByWorkspaceId.mockResolvedValue({
      items: [],
      totalCount: 0,
    });

    useCase = new GetProjectsByWorkspaceUseCase(
      projectRepository,
      workspaceExistenceChecker,
    );
  });

  describe('execute()', () => {
    it('should return projects belonging to a workspace', async () => {
      const projects = [
        createProject(
          'project-123',
          'Backend API',
          'backend-api',
        ),
        createProject(
          'project-456',
          'Frontend App',
          'frontend-app',
        ),
      ];

      findByWorkspaceId.mockResolvedValue({
        items: projects,
        totalCount: 2,
      });

      const result = await useCase.execute({
        workspaceId: 'workspace-123',
        offset: 0,
        limit: 20,
      });

      expect(existsById).toHaveBeenCalledWith('workspace-123');

      expect(findByWorkspaceId).toHaveBeenCalledWith(
        'workspace-123',
        {
          offset: 0,
          limit: 20,
        },
      );

      expect(result.items).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.items[0].name).toBe('Backend API');
      expect(result.items[1].name).toBe('Frontend App');
    });

    it('should return an empty list when workspace has no projects', async () => {
      findByWorkspaceId.mockResolvedValue({
        items: [],
        totalCount: 0,
      });

      const result = await useCase.execute({
        workspaceId: 'workspace-123',
        offset: 0,
        limit: 20,
      });

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should throw WorkspaceNotFoundError when workspace does not exist', async () => {
      existsById.mockResolvedValue(false);

      await expect(
        useCase.execute({
          workspaceId: 'missing-workspace',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBeInstanceOf(WorkspaceNotFoundError);

      expect(findByWorkspaceId).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const repositoryError = new Error('Database unavailable');

      findByWorkspaceId.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          workspaceId: 'workspace-123',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBe(repositoryError);
    });

    it('should propagate workspace checker errors', async () => {
      const databaseError = new Error('Database connection failed');

      existsById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          workspaceId: 'workspace-123',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBe(databaseError);

      expect(findByWorkspaceId).not.toHaveBeenCalled();
    });
  });
});
