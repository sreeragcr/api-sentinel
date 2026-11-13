import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GetRestEndpointsByApiDefinitionUseCase,
} from './get-rest-endpoints-by-api-definition.use-case.js';

import {
  RestEndpoint,
} from '../../domain/entities/rest-endpoint.entity.js';

import {
  HttpMethod,
} from '../../domain/enums/http-method.enum.js';

import type {
  RestEndpointRepository,
} from '../ports/rest-endpoint.repository.js';

import type {
  ApiDefinitionRepository,
} from '../ports/api-definition.repository.js';

import {
  ApiDefinition,
} from '../../domain/entities/api-definition.entity.js';

import {
  ApiProtocol,
} from '../../domain/enums/api-protocol.enum.js';

import {
  ApiDefinitionNotFoundError,
} from '../errors/api-definition-not-found.error.js';

describe('GetRestEndpointsByApiDefinitionUseCase', () => {
  const findByApiDefinitionId =
    vi.fn<RestEndpointRepository['findByApiDefinitionId']>();

  const findById =
    vi.fn<ApiDefinitionRepository['findById']>();

  const restEndpointRepository: RestEndpointRepository = {
    save: vi.fn(),
    update: vi.fn(),
    findById: vi.fn(),
    findByApiDefinitionIdAndMethodAndPath: vi.fn(),
    findByApiDefinitionId,
  };

  const apiDefinitionRepository: ApiDefinitionRepository = {
    save: vi.fn(),
    findById,
    findByProjectIdAndName: vi.fn(),
    findByProjectId: vi.fn(),
  };

  let useCase: GetRestEndpointsByApiDefinitionUseCase;

  const createApiDefinition = () =>
    ApiDefinition.create({
      id: 'api-definition-123',
      projectId: 'project-123',
      name: 'User Management API',
      protocol: ApiProtocol.REST,
    });

  const createEndpoint = (): RestEndpoint =>
    RestEndpoint.create({
      id: 'endpoint-123',
      apiDefinitionId: 'api-definition-123',
      name: 'Get Users',
      method: HttpMethod.GET,
      path: '/users',
    });

  beforeEach(() => {
    findById.mockReset();
    findByApiDefinitionId.mockReset();

    useCase = new GetRestEndpointsByApiDefinitionUseCase(
      restEndpointRepository,
      apiDefinitionRepository,
    );
  });

  describe('execute()', () => {
    it('should return paginated REST endpoints when the API definition exists', async () => {
      const apiDefinition = createApiDefinition();
      const endpoint = createEndpoint();

      findById.mockResolvedValue(apiDefinition);

      findByApiDefinitionId.mockResolvedValue({
        items: [endpoint],
        totalCount: 5,
      });

      const result = await useCase.execute({
        apiDefinitionId: 'api-definition-123',
        offset: 0,
        limit: 2,
      });

      expect(result.items).toEqual([endpoint]);
      expect(result.totalCount).toBe(5);

      expect(findById).toHaveBeenCalledWith(
        'api-definition-123',
      );

      expect(findByApiDefinitionId).toHaveBeenCalledWith(
        'api-definition-123',
        {
          offset: 0,
          limit: 2,
        },
      );
    });

    it('should throw ApiDefinitionNotFoundError when the API definition does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          apiDefinitionId: 'missing-api-definition',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBeInstanceOf(ApiDefinitionNotFoundError);

      expect(findById).toHaveBeenCalledWith(
        'missing-api-definition',
      );

      expect(findByApiDefinitionId).not.toHaveBeenCalled();
    });

    it('should return an empty result when the API definition has no endpoints', async () => {
      findById.mockResolvedValue(createApiDefinition());

      findByApiDefinitionId.mockResolvedValue({
        items: [],
        totalCount: 0,
      });

      const result = await useCase.execute({
        apiDefinitionId: 'api-definition-123',
        offset: 0,
        limit: 20,
      });

      expect(result).toEqual({
        items: [],
        totalCount: 0,
      });
    });

    it('should propagate API definition repository errors', async () => {
      const databaseError = new Error('Database unavailable');

      findById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          apiDefinitionId: 'api-definition-123',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBe(databaseError);

      expect(findByApiDefinitionId).not.toHaveBeenCalled();
    });

    it('should propagate REST endpoint repository errors', async () => {
      const databaseError = new Error('Database unavailable');

      findById.mockResolvedValue(createApiDefinition());

      findByApiDefinitionId.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          apiDefinitionId: 'api-definition-123',
          offset: 0,
          limit: 20,
        }),
      ).rejects.toBe(databaseError);
    });
  });
});