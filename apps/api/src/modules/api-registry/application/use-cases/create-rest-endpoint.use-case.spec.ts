
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateRestEndpointUseCase } from './create-rest-endpoint.use-case.js';

import {
  RestEndpoint,
  InvalidRestEndpointError,
} from '../../domain/entities/rest-endpoint.entity.js';

import { ApiDefinition } from '../../domain/entities/api-definition.entity.js';

import { ApiProtocol } from '../../domain/enums/api-protocol.enum.js';

import { HttpMethod } from '../../domain/enums/http-method.enum.js';

import type {
  RestEndpointRepository,
} from '../ports/rest-endpoint.repository.js';

import type {
  ApiDefinitionRepository,
} from '../ports/api-definition.repository.js';

import {
  ApiDefinitionNotFoundError,
} from '../errors/api-definition-not-found.error.js';

import {
  DuplicateRestEndpointError,
} from '../errors/duplicate-rest-endpoint.error.js';

describe('CreateRestEndpointUseCase', () => {
  const save = vi.fn<RestEndpointRepository['save']>();

  const findByApiDefinitionIdAndMethodAndPath =
    vi.fn<
      RestEndpointRepository['findByApiDefinitionIdAndMethodAndPath']
    >();

  const findApiDefinitionById =
    vi.fn<ApiDefinitionRepository['findById']>();

  const restEndpointRepository: RestEndpointRepository = {
    save,
    findById: vi.fn<RestEndpointRepository['findById']>(),
    findByApiDefinitionIdAndMethodAndPath,
    findByApiDefinitionId: vi.fn(),
  };

  const apiDefinitionRepository: ApiDefinitionRepository = {
    save: vi.fn(),
    findById: findApiDefinitionById,
    findByProjectIdAndName: vi.fn(),
    findByProjectId: vi.fn(),
  };

  let useCase: CreateRestEndpointUseCase;

  const existingApiDefinition = ApiDefinition.create({
    id: 'api-definition-123',
    projectId: 'project-123',
    name: 'User API',
    protocol: ApiProtocol.REST,
  });

  beforeEach(() => {
    save.mockReset();
    findByApiDefinitionIdAndMethodAndPath.mockReset();
    findApiDefinitionById.mockReset();

    findApiDefinitionById.mockResolvedValue(
      existingApiDefinition,
    );

    findByApiDefinitionIdAndMethodAndPath.mockResolvedValue(null);

    save.mockImplementation(async (endpoint) => endpoint);

    useCase = new CreateRestEndpointUseCase(
      restEndpointRepository,
      apiDefinitionRepository,
    );
  });

  describe('execute()', () => {
    it('should create and save a REST endpoint successfully', async () => {
      const result = await useCase.execute({
        apiDefinitionId: 'api-definition-123',
        name: 'Get Users',
        description: 'Retrieve all users',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(result).toBeInstanceOf(RestEndpoint);
      expect(result.apiDefinitionId).toBe('api-definition-123');
      expect(result.name).toBe('Get Users');
      expect(result.description).toBe('Retrieve all users');
      expect(result.method).toBe(HttpMethod.GET);
      expect(result.path).toBe('/users');

      expect(findApiDefinitionById).toHaveBeenCalledWith(
        'api-definition-123',
      );

      expect(findByApiDefinitionIdAndMethodAndPath).toHaveBeenCalledWith(
        'api-definition-123',
        HttpMethod.GET,
        '/users',
      );

      expect(save).toHaveBeenCalledOnce();
      expect(save).toHaveBeenCalledWith(result);
    });

    it('should generate a valid UUID for the endpoint', async () => {
      const result = await useCase.execute({
        apiDefinitionId: 'api-definition-123',
        name: 'Get Users',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should set description to null when not provided', async () => {
      const result = await useCase.execute({
        apiDefinitionId: 'api-definition-123',
        name: 'Get Users',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(result.description).toBeNull();
    });

    it('should throw ApiDefinitionNotFoundError when API definition does not exist', async () => {
      findApiDefinitionById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          apiDefinitionId: 'missing-api-definition',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBeInstanceOf(ApiDefinitionNotFoundError);

      expect(
        findByApiDefinitionIdAndMethodAndPath,
      ).not.toHaveBeenCalled();

      expect(save).not.toHaveBeenCalled();
    });

    it('should throw DuplicateRestEndpointError when method and path already exist', async () => {
      const existingEndpoint = RestEndpoint.create({
        id: 'existing-endpoint',
        apiDefinitionId: 'api-definition-123',
        name: 'Get Users',
        method: HttpMethod.GET,
        path: '/users',
      });

      findByApiDefinitionIdAndMethodAndPath.mockResolvedValue(
        existingEndpoint,
      );

      await expect(
        useCase.execute({
          apiDefinitionId: 'api-definition-123',
          name: 'Another Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBeInstanceOf(DuplicateRestEndpointError);

      expect(save).not.toHaveBeenCalled();
    });

    it('should normalize path before checking for duplicates', async () => {
      await useCase.execute({
        apiDefinitionId: 'api-definition-123',
        name: 'Get Users',
        method: HttpMethod.GET,
        path: '  /users  ',
      });

      expect(findByApiDefinitionIdAndMethodAndPath).toHaveBeenCalledWith(
        'api-definition-123',
        HttpMethod.GET,
        '/users',
      );
    });

    it('should reject invalid endpoint names', async () => {
      await expect(
        useCase.execute({
          apiDefinitionId: 'api-definition-123',
          name: '   ',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBeInstanceOf(InvalidRestEndpointError);

      expect(save).not.toHaveBeenCalled();
    });

    it('should propagate repository save errors', async () => {
      const databaseError = new Error('Database unavailable');

      save.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBe(databaseError);
    });

    it('should propagate API definition repository errors', async () => {
      const databaseError = new Error('Database query failed');

      findApiDefinitionById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBe(databaseError);

      expect(save).not.toHaveBeenCalled();
    });

    it('should propagate duplicate lookup errors', async () => {
      const databaseError = new Error('Database query failed');

      findByApiDefinitionIdAndMethodAndPath.mockRejectedValue(
        databaseError,
      );

      await expect(
        useCase.execute({
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBe(databaseError);

      expect(save).not.toHaveBeenCalled();
    });
  });
});
