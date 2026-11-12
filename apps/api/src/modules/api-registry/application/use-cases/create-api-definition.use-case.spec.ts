
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateApiDefinitionUseCase } from './create-api-definition.use-case.js';

import {
  ApiDefinition,
  InvalidApiDefinitionError,
} from '../../domain/entities/api-definition.entity.js';

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

import {
  DuplicateApiDefinitionError,
} from '../errors/duplicate-api-definition.error.js';

describe('CreateApiDefinitionUseCase', () => {
  const save = vi.fn<ApiDefinitionRepository['save']>();

  const findById = vi.fn<ApiDefinitionRepository['findById']>();

  const findByProjectIdAndName =
    vi.fn<ApiDefinitionRepository['findByProjectIdAndName']>();

  // Added mock for the new repository method
  const findByProjectId =
    vi.fn<ApiDefinitionRepository['findByProjectId']>();

  const existsById =
    vi.fn<ProjectExistenceChecker['existsById']>();

  const apiDefinitionRepository: ApiDefinitionRepository = {
    save,
    findById,
    findByProjectIdAndName,
    findByProjectId: vi.fn().mockResolvedValue({
    items: [],
    totalCount: 0,
  }),
  };

  const projectExistenceChecker: ProjectExistenceChecker = {
    existsById,
  };

  let useCase: CreateApiDefinitionUseCase;

  beforeEach(() => {
    save.mockReset();
    findById.mockReset();
    findByProjectIdAndName.mockReset();
    findByProjectId.mockReset();
    existsById.mockReset();

    existsById.mockResolvedValue(true);
    findByProjectIdAndName.mockResolvedValue(null);
    findByProjectId.mockResolvedValue({
      items: [],
      totalCount: 0,
    });
    findById.mockResolvedValue(null);

    save.mockImplementation(async (apiDefinition) => apiDefinition);

    useCase = new CreateApiDefinitionUseCase(
      apiDefinitionRepository,
      projectExistenceChecker,
    );
  });

  describe('execute()', () => {
    it('should create and save an API definition successfully', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        name: 'User API',
        description: 'API for managing users',
        protocol: ApiProtocol.REST,
      });

      expect(result).toBeInstanceOf(ApiDefinition);
      expect(result.name).toBe('User API');
      expect(result.projectId).toBe('project-123');
      expect(result.description).toBe('API for managing users');
      expect(result.protocol).toBe(ApiProtocol.REST);

      expect(existsById).toHaveBeenCalledWith('project-123');

      expect(findByProjectIdAndName).toHaveBeenCalledWith(
        'project-123',
        'User API',
      );

      expect(save).toHaveBeenCalledOnce();
      expect(save).toHaveBeenCalledWith(result);
    });

    it('should generate a valid UUID for the API definition', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        name: 'User API',
        protocol: ApiProtocol.REST,
      });

      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should set description to null when not provided', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        name: 'User API',
        protocol: ApiProtocol.REST,
      });

      expect(result.description).toBeNull();
    });

    it('should support GraphQL protocol', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        name: 'GraphQL API',
        protocol: ApiProtocol.GRAPHQL,
      });

      expect(result.protocol).toBe(ApiProtocol.GRAPHQL);
    });

    it('should support gRPC protocol', async () => {
      const result = await useCase.execute({
        projectId: 'project-123',
        name: 'Organization Service',
        protocol: ApiProtocol.GRPC,
      });

      expect(result.protocol).toBe(ApiProtocol.GRPC);
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      existsById.mockResolvedValue(false);

      await expect(
        useCase.execute({
          projectId: 'missing-project',
          name: 'User API',
          protocol: ApiProtocol.REST,
        }),
      ).rejects.toBeInstanceOf(ProjectNotFoundError);

      expect(existsById).toHaveBeenCalledWith('missing-project');
      expect(findByProjectIdAndName).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    });

    it('should throw DuplicateApiDefinitionError when API name already exists', async () => {
      const existingApiDefinition = ApiDefinition.create({
        id: 'existing-api-id',
        projectId: 'project-123',
        name: 'User API',
        protocol: ApiProtocol.REST,
      });

      findByProjectIdAndName.mockResolvedValue(existingApiDefinition);

      await expect(
        useCase.execute({
          projectId: 'project-123',
          name: 'User API',
          protocol: ApiProtocol.REST,
        }),
      ).rejects.toBeInstanceOf(DuplicateApiDefinitionError);

      expect(findByProjectIdAndName).toHaveBeenCalledWith(
        'project-123',
        'User API',
      );

      expect(save).not.toHaveBeenCalled();
    });

    it('should normalize API name before checking for duplicates', async () => {
      await useCase.execute({
        projectId: 'project-123',
        name: '  User API  ',
        protocol: ApiProtocol.REST,
      });

      expect(findByProjectIdAndName).toHaveBeenCalledWith(
        'project-123',
        'User API',
      );
    });

    it('should reject invalid API names', async () => {
      await expect(
        useCase.execute({
          projectId: 'project-123',
          name: '   ',
          protocol: ApiProtocol.REST,
        }),
      ).rejects.toBeInstanceOf(InvalidApiDefinitionError);

      expect(save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const repositoryError = new Error('Database unavailable');

      save.mockRejectedValue(repositoryError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
          name: 'User API',
          protocol: ApiProtocol.REST,
        }),
      ).rejects.toBe(repositoryError);
    });

    it('should propagate project checker errors', async () => {
      const databaseError = new Error('Database connection failed');

      existsById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
          name: 'User API',
          protocol: ApiProtocol.REST,
        }),
      ).rejects.toBe(databaseError);

      expect(save).not.toHaveBeenCalled();
    });

    it('should propagate duplicate checker repository errors', async () => {
      const databaseError = new Error('Database query failed');

      findByProjectIdAndName.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          projectId: 'project-123',
          name: 'User API',
          protocol: ApiProtocol.REST,
        }),
      ).rejects.toBe(databaseError);

      expect(save).not.toHaveBeenCalled();
    });
  });
});
