
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PermanentlyDeleteProjectUseCase } from './permanently-delete-project.use-case.js';

import { Project } from '../../domain/entities/project.entity.js';

import type {
  ProjectRepository,
} from '../ports/project.repository.js';

import {
  ProjectNotFoundError,
} from '../errors/project-not-found.error.js';

import {
  ProjectNotInTrashError,
} from '../errors/project-not-in-trash.error.js';

describe('PermanentlyDeleteProjectUseCase', () => {
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

  let useCase: PermanentlyDeleteProjectUseCase;

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
    findDeletedByWorkspaceId.mockReset();
    deleteById.mockReset();

    findById.mockResolvedValue(createProject());
    deleteById.mockResolvedValue(undefined);

    useCase = new PermanentlyDeleteProjectUseCase(projectRepository);
  });

  describe('execute()', () => {
    it('should permanently delete a project that is in trash', async () => {
      const deletedProject = createProject().softDelete();

      findById.mockResolvedValue(deletedProject);

      await expect(
        useCase.execute({
          projectId: 'project-123',
        }),
      ).resolves.toBeUndefined();

      expect(findById).toHaveBeenCalledWith('project-123');
      expect(deleteById).toHaveBeenCalledOnce();
      expect(deleteById).toHaveBeenCalledWith('project-123');

      expect(update).not.toHaveBeenCalled();
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          projectId: 'missing-project',
        }),
      ).rejects.toBeInstanceOf(ProjectNotFoundError);

      expect(deleteById).not.toHaveBeenCalled();
    });

    it('should throw ProjectNotInTrashError when project is active', async () => {
      findById.mockResolvedValue(createProject());

      await expect(
        useCase.execute({
          projectId: 'project-123',
        }),
      ).rejects.toBeInstanceOf(ProjectNotInTrashError);

      expect(deleteById).not.toHaveBeenCalled();
    });

    it('should propagate repository retrieval errors', async () => {
      const repositoryError = new Error('Database unavailable');

      findById.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
        }),
      ).rejects.toBe(repositoryError);

      expect(deleteById).not.toHaveBeenCalled();
    });

    it('should propagate repository permanent deletion errors', async () => {
      const repositoryError = new Error('Database unavailable');

      const deletedProject = createProject().softDelete();

      findById.mockResolvedValue(deletedProject);
      deleteById.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
        }),
      ).rejects.toBe(repositoryError);

      expect(deleteById).toHaveBeenCalledWith('project-123');
    });
  });
});
