
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteProjectUseCase } from './delete-project.use-case.js';

import { Project } from '../../domain/entities/project.entity.js';

import type {
  ProjectRepository,
} from '../ports/project.repository.js';

import {
  ProjectNotFoundError,
} from '../errors/project-not-found.error.js';

describe('DeleteProjectUseCase', () => {
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

  let useCase: DeleteProjectUseCase;

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

    update.mockImplementation(async (project) => project);

    useCase = new DeleteProjectUseCase(projectRepository);
  });

  describe('execute()', () => {
    it('should soft-delete an existing project', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
      });

      expect(findById).toHaveBeenCalledWith('project-123');

      expect(result.deletedAt).toBeInstanceOf(Date);

      expect(update).toHaveBeenCalledOnce();
      expect(update).toHaveBeenCalledWith(result);

      expect(result.name).toBe('Backend API');
      expect(result.slug).toBe('backend-api');
      expect(result.id).toBe('project-123');
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          projectId: 'missing-project',
        }),
      ).rejects.toBeInstanceOf(ProjectNotFoundError);

      expect(update).not.toHaveBeenCalled();
    });

    it('should not update a project that is already deleted', async () => {
      const deletedProject = createProject().softDelete();

      findById.mockResolvedValue(deletedProject);

      const result = await useCase.execute({
        projectId: 'project-123',
      });

      expect(result).toBe(deletedProject);
      expect(result.deletedAt).toBe(deletedProject.deletedAt);

      expect(update).not.toHaveBeenCalled();
    });

    it('should propagate repository retrieval errors', async () => {
      const repositoryError = new Error('Database unavailable');

      findById.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
        }),
      ).rejects.toBe(repositoryError);

      expect(update).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      const repositoryError = new Error('Database unavailable');

      update.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
        }),
      ).rejects.toBe(repositoryError);
    });
  });
});
