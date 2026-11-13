
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GetRestEndpointByIdUseCase,
} from './get-rest-endpoint-by-id.use-case.js';

import {
  RestEndpoint,
} from '../../domain/entities/rest-endpoint.entity.js';

import {
  HttpMethod,
} from '../../domain/enums/http-method.enum.js';

import type {
  RestEndpointRepository,
} from '../ports/rest-endpoint.repository.js';

import {
  RestEndpointNotFoundError,
} from '../errors/rest-endpoint-not-found.error.js';

describe('GetRestEndpointByIdUseCase', () => {
  const findById = vi.fn<RestEndpointRepository['findById']>();

  const restEndpointRepository: RestEndpointRepository = {
    save: vi.fn(),
    update: vi.fn(),
    findById,
    findByApiDefinitionIdAndMethodAndPath: vi.fn(),
    findByApiDefinitionId: vi.fn(),
  };

  let useCase: GetRestEndpointByIdUseCase;

  beforeEach(() => {
    findById.mockReset();

    useCase = new GetRestEndpointByIdUseCase(
      restEndpointRepository,
    );
  });

  describe('execute()', () => {
    it('should return a REST endpoint when it exists', async () => {
      const restEndpoint = RestEndpoint.create({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get Users',
        method: HttpMethod.GET,
        path: '/users',
      });

      findById.mockResolvedValue(restEndpoint);

      const result = await useCase.execute('endpoint-123');

      expect(result).toBe(restEndpoint);
      expect(findById).toHaveBeenCalledWith('endpoint-123');
    });

    it('should throw RestEndpointNotFoundError when it does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute('missing-endpoint'),
      ).rejects.toBeInstanceOf(RestEndpointNotFoundError);

      expect(findById).toHaveBeenCalledWith('missing-endpoint');
    });

    it('should propagate repository errors', async () => {
      const databaseError = new Error('Database unavailable');

      findById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute('endpoint-123'),
      ).rejects.toBe(databaseError);
    });
  });
});
