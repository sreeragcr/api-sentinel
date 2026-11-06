
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetProjectByIdUseCase } from './get-project-by-id.use-case.js';

import { Project } from '../../domain/entities/project.entity.js';

import type { ProjectRepository } from '../ports/project.repository.js';

import { ProjectNotFoundError } from '../errors/project-not-found.error.js';

describe('GetProjectByIdUseCase', () => {
  const save = vi.fn<ProjectRepository['save']>();
  const findById = vi.fn<ProjectRepository['findById']>();
  const findByWorkspaceId =
    vi.fn<ProjectRepository['findByWorkspaceId']>();

  const repository: ProjectRepository = {
    save,
    findById,
    findByWorkspaceId,
  };

  let useCase: GetProjectByIdUseCase;

  const createProject = () =>
    Project.create({
      id: 'project-123',
      workspaceId: 'workspace-123',
      name: 'Backend API',
      slug: 'backend-api',
      description: 'Backend API testing project',
    });

  beforeEach(() => {
    save.mockReset();
    findById.mockReset();
    findByWorkspaceId.mockReset();

    useCase = new GetProjectByIdUseCase(repository);
  });

  describe('execute()', () => {
    it('should return a project when it exists', async () => {
      const project = createProject();

      findById.mockResolvedValue(project);

      const result = await useCase.execute('project-123');

      expect(findById).toHaveBeenCalledWith('project-123');
      expect(result).toBe(project);
      expect(result.name).toBe('Backend API');
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute('missing-project'),
      ).rejects.toBeInstanceOf(ProjectNotFoundError);

      expect(findById).toHaveBeenCalledWith('missing-project');
    });

    it('should propagate repository errors', async () => {
      const repositoryError = new Error('Database unavailable');

      findById.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute('project-123'),
      ).rejects.toBe(repositoryError);
    });
  });
});
