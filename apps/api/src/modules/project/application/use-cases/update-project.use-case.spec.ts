
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UpdateProjectUseCase } from './update-project.use-case.js';

import {
  Project,
  InvalidProjectError,
} from '../../domain/entities/project.entity.js';

import type {
  ProjectRepository,
} from '../ports/project.repository.js';

import {
  ProjectNotFoundError,
} from '../errors/project-not-found.error.js';

describe('UpdateProjectUseCase', () => {
  const save = vi.fn<ProjectRepository['save']>();
  const update = vi.fn<ProjectRepository['update']>();
  const findById = vi.fn<ProjectRepository['findById']>();

  const findByWorkspaceId =
    vi.fn<ProjectRepository['findByWorkspaceId']>();

  const findDeletedByWorkspaceId =
    vi.fn<ProjectRepository['findDeletedByWorkspaceId']>();

  const deleteById = vi.fn<ProjectRepository['deleteById']>();

  const projectRepository: ProjectRepository = {
    save,
    update,
    findById,
    findByWorkspaceId,
    findDeletedByWorkspaceId,
    deleteById,
  };

  let useCase: UpdateProjectUseCase;

  const createProject = () =>
    Project.create({
      id: 'project-123',
      workspaceId: 'workspace-123',
      name: 'Backend API',
      slug: 'backend-api',
      description: 'Original description',
    });

  beforeEach(() => {
    save.mockReset();
    update.mockReset();
    findById.mockReset();
    findByWorkspaceId.mockReset();

    findById.mockResolvedValue(createProject());

    update.mockImplementation(async (project) => project);

    useCase = new UpdateProjectUseCase(projectRepository);
  });

  describe('execute()', () => {
    it('should update project name and regenerate slug', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        name: 'Backend API Testing',
      });

      expect(findById).toHaveBeenCalledWith('project-123');

      expect(result.name).toBe('Backend API Testing');
      expect(result.slug).toBe('backend-api-testing');

      expect(result.id).toBe('project-123');
      expect(result.workspaceId).toBe('workspace-123');

      expect(update).toHaveBeenCalledOnce();
      expect(update).toHaveBeenCalledWith(result);
    });

    it('should update description without changing project name or slug', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        description: 'Updated description',
      });

      expect(result.name).toBe('Backend API');
      expect(result.slug).toBe('backend-api');
      expect(result.description).toBe('Updated description');

      expect(update).toHaveBeenCalledOnce();
    });

    it('should clear description when null is provided', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        description: null,
      });

      expect(result.description).toBeNull();
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          projectId: 'missing-project',
          name: 'Updated Project',
        }),
      ).rejects.toBeInstanceOf(ProjectNotFoundError);

      expect(update).not.toHaveBeenCalled();
    });

    it('should reject an update without any fields', async () => {
      await expect(
        useCase.execute({
          projectId: 'project-123',
        }),
      ).rejects.toBeInstanceOf(InvalidProjectError);

      expect(findById).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it('should reject project names without valid slug characters', async () => {
      await expect(
        useCase.execute({
          projectId: 'project-123',
          name: '🔥',
        }),
      ).rejects.toBeInstanceOf(InvalidProjectError);

      expect(update).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      const repositoryError = new Error('Database unavailable');

      update.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
          name: 'Updated Project',
        }),
      ).rejects.toBe(repositoryError);
    });

    it('should propagate repository retrieval errors', async () => {
      const repositoryError = new Error('Database unavailable');

      findById.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
          name: 'Updated Project',
        }),
      ).rejects.toBe(repositoryError);

      expect(update).not.toHaveBeenCalled();
    });
  });
});
