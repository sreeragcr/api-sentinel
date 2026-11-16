
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CreateRestRequestConfigurationUseCase,
} from './create-rest-request-configuration.use-case.js';

import {
  RestRequestConfiguration,
} from '../../domain/entities/rest-request-configuration.entity.js';

import {
  AuthenticationType,
} from '../../domain/enums/authentication-type.enum.js';

import {
  RequestBodyType,
} from '../../domain/enums/request-body-type.enum.js';

import type {
  RestEndpointRepository,
} from '../ports/rest-endpoint.repository.js';

import type {
  RestRequestConfigurationRepository,
} from '../ports/rest-request-configuration.repository.js';

import {
  RestEndpoint,
} from '../../domain/entities/rest-endpoint.entity.js';

import {
  HttpMethod,
} from '../../domain/enums/http-method.enum.js';

import {
  RestEndpointNotFoundError,
} from '../errors/rest-endpoint-not-found.error.js';

describe('CreateRestRequestConfigurationUseCase', () => {
  const save =
    vi.fn<RestRequestConfigurationRepository['save']>();

  const findById =
    vi.fn<RestEndpointRepository['findById']>();

  const restRequestConfigurationRepository:
    RestRequestConfigurationRepository = {
      save,
      findByEndpointId: vi.fn(),
    };

  const restEndpointRepository: RestEndpointRepository = {
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById,
    findByApiDefinitionIdAndMethodAndPath: vi.fn(),
    findByApiDefinitionId: vi.fn(),
  };

  let useCase: CreateRestRequestConfigurationUseCase;

  const existingEndpoint = RestEndpoint.create({
    id: 'endpoint-123',
    apiDefinitionId: 'api-definition-123',
    name: 'Get Users',
    method: HttpMethod.GET,
    path: '/users',
  });

  beforeEach(() => {
    save.mockReset();
    findById.mockReset();

    findById.mockResolvedValue(existingEndpoint);
    save.mockImplementation(async (configuration) => configuration);

    useCase = new CreateRestRequestConfigurationUseCase(
      restRequestConfigurationRepository,
      restEndpointRepository,
    );
  });

  describe('execute()', () => {
    it('should create and save a request configuration successfully', async () => {
      const result = await useCase.execute({
        endpointId: 'endpoint-123',
        queryParameters: [
          {
            key: 'page',
            value: '1',
            enabled: true,
          },
        ],
        headers: [
          {
            key: 'Accept',
            value: 'application/json',
            enabled: true,
          },
        ],
        authentication: {
          type: AuthenticationType.NONE,
        },
        body: {
          type: RequestBodyType.NONE,
        },
      });

      expect(result).toBeInstanceOf(RestRequestConfiguration);
      expect(result.endpointId).toBe('endpoint-123');

      expect(result.queryParameters).toEqual([
        {
          key: 'page',
          value: '1',
          enabled: true,
        },
      ]);

      expect(result.headers).toEqual([
        {
          key: 'Accept',
          value: 'application/json',
          enabled: true,
        },
      ]);

      expect(findById).toHaveBeenCalledWith('endpoint-123');
      expect(save).toHaveBeenCalledOnce();
      expect(save).toHaveBeenCalledWith(result);
    });

    it('should generate a valid UUID for the configuration', async () => {
      const result = await useCase.execute({
        endpointId: 'endpoint-123',
      });

      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should use default values when optional configuration fields are omitted', async () => {
      const result = await useCase.execute({
        endpointId: 'endpoint-123',
      });

      expect(result.queryParameters).toEqual([]);
      expect(result.pathParameters).toEqual([]);
      expect(result.headers).toEqual([]);
      expect(result.authentication).toEqual({
        type: AuthenticationType.NONE,
      });
      expect(result.body).toEqual({
        type: RequestBodyType.NONE,
      });
    });

    it('should throw RestEndpointNotFoundError when endpoint does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          endpointId: 'missing-endpoint',
        }),
      ).rejects.toBeInstanceOf(RestEndpointNotFoundError);

      expect(findById).toHaveBeenCalledWith('missing-endpoint');
      expect(save).not.toHaveBeenCalled();
    });

    it('should reject invalid configuration data', async () => {
      await expect(
        useCase.execute({
          endpointId: 'endpoint-123',
          body: {
            type: RequestBodyType.JSON,
            content: '{invalid json}',
          },
        }),
      ).rejects.toThrow('Invalid JSON request body');

      expect(save).not.toHaveBeenCalled();
    });

    it('should propagate repository save errors', async () => {
      const databaseError = new Error('Database unavailable');

      save.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          endpointId: 'endpoint-123',
        }),
      ).rejects.toBe(databaseError);
    });

    it('should propagate endpoint repository errors', async () => {
      const databaseError = new Error('Database query failed');

      findById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          endpointId: 'endpoint-123',
        }),
      ).rejects.toBe(databaseError);

      expect(save).not.toHaveBeenCalled();
    });
  });
});
