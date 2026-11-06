
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateWorkspaceUseCase } from './create-workspace.use-case.js';

import {
  Workspace,
  InvalidWorkspaceError,
} from '../../domain/entities/workspace.entity.js';

import {
  WorkspaceRepository,
} from '../ports/workspace.repository.js';

import {
  WorkspaceSlugAlreadyExistsError,
} from '../errors/workspace-slug-already-exists.error.js';

describe('CreateWorkspaceUseCase', () => {
  const save = vi.fn<WorkspaceRepository['save']>();

  const repository: WorkspaceRepository = {
    save,
  };

  let useCase: CreateWorkspaceUseCase;

  beforeEach(() => {
    save.mockReset();

    // Simulate successful repository persistence.
    save.mockImplementation(async (workspace) => workspace);

    useCase = new CreateWorkspaceUseCase(repository);
  });

  describe('execute()', () => {
    it('should create and save a workspace successfully', async () => {
      const result = await useCase.execute({
        name: 'API Sentinel',
        description: 'API testing platform',
      });

      expect(save).toHaveBeenCalledOnce();

      const savedWorkspace = save.mock.calls[0][0];

      expect(savedWorkspace).toBeInstanceOf(Workspace);
      expect(savedWorkspace.name).toBe('API Sentinel');
      expect(savedWorkspace.slug).toBe('api-sentinel');
      expect(savedWorkspace.description).toBe(
        'API testing platform',
      );

      expect(result).toBe(savedWorkspace);
    });

    it('should trim whitespace from workspace name', async () => {
      const result = await useCase.execute({
        name: '  Development Team  ',
      });

      expect(result.name).toBe('Development Team');
      expect(result.slug).toBe('development-team');
    });

    it('should generate a normalized slug', async () => {
      const result = await useCase.execute({
        name: 'Café & QA Team',
      });

      expect(result.slug).toBe('cafe-qa-team');
    });

    it('should use null when description is not provided', async () => {
      const result = await useCase.execute({
        name: 'Development Team',
      });

      expect(result.description).toBeNull();
    });

    it('should throw an error when workspace name has no valid slug', async () => {
      await expect(
        useCase.execute({
          name: '🔥',
        }),
      ).rejects.toBeInstanceOf(InvalidWorkspaceError);

      expect(save).not.toHaveBeenCalled();
    });

    it('should propagate duplicate workspace errors from repository', async () => {
      const repositoryError =
        new WorkspaceSlugAlreadyExistsError('api-sentinel');

      save.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          name: 'API Sentinel',
        }),
      ).rejects.toBe(repositoryError);
    });
  });
});
