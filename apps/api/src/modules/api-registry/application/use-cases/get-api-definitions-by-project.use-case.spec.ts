
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetApiDefinitionsByProjectUseCase } from './get-api-definitions-by-project.use-case.js';

import { ApiDefinition } from '../../domain/entities/api-definition.entity.js';

import { ApiProtocol } from '../../domain/api-protocol.enum.js';

import type {
  ApiDefinitionRepository,
} from '../ports/api-definition.repository.js';

import type {
  ProjectExistenceChecker,
} from '../ports/project-existence-checker.js';

import {
  ProjectNotFoundError,
} from '../errors/project-not-found.error.js';

describe('GetApiDefinitionsByProjectUseCase', () => {
  const findByProjectId =
    vi.fn<ApiDefinitionRepository['findByProjectId']>();

  const existsById =
    vi.fn<ProjectExistenceChecker['existsById']>();

  const apiDefinitionRepository: ApiDefinitionRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByProjectIdAndName: vi.fn(),
    findByProjectId,
  };

  const projectExistenceChecker: ProjectExistenceChecker = {
    existsById,
  };

  let useCase: GetApiDefinitionsByProjectUseCase;

  beforeEach(() => {
    findByProjectId.mockReset();
    existsById.mockReset();

    existsById.mockResolvedValue(true);

    findByProjectId.mockResolvedValue({
      items: [],
      totalCount: 0,
    });

    useCase = new GetApiDefinitionsByProjectUseCase(
      apiDefinitionRepository,
      projectExistenceChecker,
    );
  });

  describe('execute()', () => {
    it('should return API definitions belonging to a project', async () => {
      const apiDefinition = ApiDefinition.create({
        id: 'api-definition-123',
        projectId: 'project-123',
        name: 'User API',
        protocol: ApiProtocol.REST,
      });

      findByProjectId.mockResolvedValue({
        items: [apiDefinition],
        totalCount: 1,
      });

      const result = await useCase.execute({
        projectId: 'project-123',
        offset: 0,
        limit: 20,
      });

      expect(result.items).toEqual([apiDefinition]);
      expect(result.totalCount).toBe(1);

      expect(existsById).toHaveBeenCalledWith('project-123');

      expect(findByProjectId).toHaveBeenCalledWith(
        'project-123',
        {
          offset: 0,
          limit: 20,
        },
      );
    });

    it('should return an empty result when the project has no API definitions', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        offset: 0,
        limit: 20,
      });

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should throw ProjectNotFoundError when the project does not exist', async () => {
      existsById.mockResolvedValue(false);

      await expect(
        useCase.execute({
          projectId: 'missing-project',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBeInstanceOf(ProjectNotFoundError);

      expect(existsById).toHaveBeenCalledWith('missing-project');
      expect(findByProjectId).not.toHaveBeenCalled();
    });

    it('should pass pagination options to the repository', async () => {
      await useCase.execute({
        projectId: 'project-123',
        offset: 20,
        limit: 10,
      });

      expect(findByProjectId).toHaveBeenCalledWith(
        'project-123',
        {
          offset: 20,
          limit: 10,
        },
      );
    });

    it('should propagate project checker errors', async () => {
      const databaseError = new Error('Database connection failed');

      existsById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBe(databaseError);

      expect(findByProjectId).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const databaseError = new Error('Database query failed');

      findByProjectId.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBe(databaseError);
    });
  });
});
