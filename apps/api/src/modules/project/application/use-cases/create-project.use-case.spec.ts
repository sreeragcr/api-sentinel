
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateProjectUseCase } from './create-project.use-case.js';

import {
  Project,
  InvalidProjectError,
} from '../../domain/entities/project.entity.js';

import type { ProjectRepository } from '../ports/project.repository.js';

import type {
  WorkspaceExistenceChecker,
} from '../ports/workspace-existence-checker.js';

import {
  WorkspaceNotFoundError,
} from '../errors/workspace-not-found.error.js';

describe('CreateProjectUseCase', () => {
  const save = vi.fn<ProjectRepository['save']>();

  const findById = vi.fn<ProjectRepository['findById']>();

  const findByWorkspaceId =
    vi.fn<ProjectRepository['findByWorkspaceId']>();

  const existsById =
    vi.fn<WorkspaceExistenceChecker['existsById']>();

  const projectRepository: ProjectRepository = {
    save,
    findById,
    findByWorkspaceId,
  };

  const workspaceExistenceChecker: WorkspaceExistenceChecker = {
    existsById,
  };

  let useCase: CreateProjectUseCase;

  beforeEach(() => {
    save.mockReset();
    findById.mockReset();
    findByWorkspaceId.mockReset();
    existsById.mockReset();

    // Default mock behavior
    existsById.mockResolvedValue(true);

    save.mockImplementation(async (project) => project);

    findById.mockResolvedValue(null);

    findByWorkspaceId.mockResolvedValue({
      items: [],
      totalCount: 0,
    });

    useCase = new CreateProjectUseCase(
      projectRepository,
      workspaceExistenceChecker,
    );
  });

  describe('execute()', () => {
    it('should create and save a project successfully', async () => {
      const result = await useCase.execute({
        workspaceId: 'workspace-123',
        name: 'Backend API',
        description: 'Backend API testing project',
      });

      expect(result).toBeInstanceOf(Project);
      expect(result.name).toBe('Backend API');
      expect(result.slug).toBe('backend-api');
      expect(result.workspaceId).toBe('workspace-123');
      expect(result.description).toBe('Backend API testing project');

      expect(existsById).toHaveBeenCalledWith('workspace-123');
      expect(save).toHaveBeenCalledOnce();
      expect(save).toHaveBeenCalledWith(result);
    });

    it('should generate a normalized slug', async () => {
      const result = await useCase.execute({
        workspaceId: 'workspace-123',
        name: 'Café & QA Team',
      });

      expect(result.name).toBe('Café & QA Team');
      expect(result.slug).toBe('cafe-qa-team');
    });

    it('should set description to null when not provided', async () => {
      const result = await useCase.execute({
        workspaceId: 'workspace-123',
        name: 'Backend API',
      });

      expect(result.description).toBeNull();
    });

    it('should throw WorkspaceNotFoundError when workspace does not exist', async () => {
      existsById.mockResolvedValue(false);

      await expect(
        useCase.execute({
          workspaceId: 'missing-workspace',
          name: 'Backend API',
        }),
      ).rejects.toBeInstanceOf(WorkspaceNotFoundError);

      expect(existsById).toHaveBeenCalledWith(
        'missing-workspace',
      );

      expect(save).not.toHaveBeenCalled();
    });

    it('should reject project names without valid slug characters', async () => {
      await expect(
        useCase.execute({
          workspaceId: 'workspace-123',
          name: '🔥',
        }),
      ).rejects.toBeInstanceOf(InvalidProjectError);

      expect(existsById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const repositoryError = new Error('Database unavailable');

      save.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          workspaceId: 'workspace-123',
          name: 'Backend API',
        }),
      ).rejects.toBe(repositoryError);
    });

    it('should propagate workspace checker errors', async () => {
      const databaseError = new Error('Database connection failed');

      existsById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          workspaceId: 'workspace-123',
          name: 'Backend API',
        }),
      ).rejects.toBe(databaseError);

      expect(save).not.toHaveBeenCalled();
    });
  });
});
