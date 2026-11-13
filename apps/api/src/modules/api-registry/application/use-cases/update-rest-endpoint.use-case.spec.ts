
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  UpdateRestEndpointUseCase,
} from './update-rest-endpoint.use-case.js';

import {
  RestEndpoint,
  InvalidRestEndpointError,
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

import {
  DuplicateRestEndpointError,
} from '../errors/duplicate-rest-endpoint.error.js';

describe('UpdateRestEndpointUseCase', () => {
  const update = vi.fn<RestEndpointRepository['update']>();

  const findById =
    vi.fn<RestEndpointRepository['findById']>();

  const findByApiDefinitionIdAndMethodAndPath =
    vi.fn<
      RestEndpointRepository['findByApiDefinitionIdAndMethodAndPath']
    >();

  const restEndpointRepository: RestEndpointRepository = {
    save: vi.fn(),
    update,
    delete: vi.fn(),
    findById,
    findByApiDefinitionIdAndMethodAndPath,
    findByApiDefinitionId: vi.fn(),
  };

  let useCase: UpdateRestEndpointUseCase;

  const existingEndpoint = RestEndpoint.create({
    id: 'endpoint-123',
    apiDefinitionId: 'api-definition-123',
    name: 'Get Users',
    description: 'Retrieve all users',
    method: HttpMethod.GET,
    path: '/users',
  });

  beforeEach(() => {
    update.mockReset();
    findById.mockReset();
    findByApiDefinitionIdAndMethodAndPath.mockReset();

    findById.mockResolvedValue(existingEndpoint);

    findByApiDefinitionIdAndMethodAndPath.mockResolvedValue(null);

    update.mockImplementation(async (endpoint) => endpoint);

    useCase = new UpdateRestEndpointUseCase(
      restEndpointRepository,
    );
  });

  describe('execute()', () => {
    it('should update and save a REST endpoint successfully', async () => {
      const result = await useCase.execute({
        id: 'endpoint-123',
        name: 'Get All Users',
        description: 'Retrieve all registered users',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(result).toBeInstanceOf(RestEndpoint);
      expect(result.id).toBe('endpoint-123');
      expect(result.apiDefinitionId).toBe('api-definition-123');
      expect(result.name).toBe('Get All Users');
      expect(result.description).toBe(
        'Retrieve all registered users',
      );
      expect(result.method).toBe(HttpMethod.GET);
      expect(result.path).toBe('/users');

      expect(findById).toHaveBeenCalledWith('endpoint-123');

      expect(
        findByApiDefinitionIdAndMethodAndPath,
      ).toHaveBeenCalledWith(
        'api-definition-123',
        HttpMethod.GET,
        '/users',
      );

      expect(update).toHaveBeenCalledOnce();
      expect(update).toHaveBeenCalledWith(result);
    });

    it('should throw RestEndpointNotFoundError when endpoint does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          id: 'missing-endpoint',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBeInstanceOf(RestEndpointNotFoundError);

      expect(
        findByApiDefinitionIdAndMethodAndPath,
      ).not.toHaveBeenCalled();

      expect(update).not.toHaveBeenCalled();
    });

    it('should throw DuplicateRestEndpointError when another endpoint uses the same method and path', async () => {
      const anotherEndpoint = RestEndpoint.create({
        id: 'endpoint-456',
        apiDefinitionId: 'api-definition-123',
        name: 'Another Get Users',
        method: HttpMethod.GET,
        path: '/users',
      });

      findByApiDefinitionIdAndMethodAndPath.mockResolvedValue(
        anotherEndpoint,
      );

      await expect(
        useCase.execute({
          id: 'endpoint-123',
          name: 'Updated Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBeInstanceOf(DuplicateRestEndpointError);

      expect(update).not.toHaveBeenCalled();
    });

    it('should allow the endpoint to retain its existing method and path', async () => {
      findByApiDefinitionIdAndMethodAndPath.mockResolvedValue(
        existingEndpoint,
      );

      const result = await useCase.execute({
        id: 'endpoint-123',
        name: 'Updated Get Users',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(result.name).toBe('Updated Get Users');
      expect(update).toHaveBeenCalledOnce();
    });

    it('should normalize path before checking for duplicates', async () => {
      await useCase.execute({
        id: 'endpoint-123',
        name: 'Get Users',
        method: HttpMethod.GET,
        path: '  /users  ',
      });

      expect(
        findByApiDefinitionIdAndMethodAndPath,
      ).toHaveBeenCalledWith(
        'api-definition-123',
        HttpMethod.GET,
        '/users',
      );

      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/users',
        }),
      );
    });

    it('should set description to null when not provided', async () => {
      const result = await useCase.execute({
        id: 'endpoint-123',
        name: 'Get Users',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(result.description).toBeNull();
    });

    it('should reject invalid endpoint names', async () => {
      await expect(
        useCase.execute({
          id: 'endpoint-123',
          name: '   ',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBeInstanceOf(InvalidRestEndpointError);

      expect(update).not.toHaveBeenCalled();
    });

    it('should propagate endpoint repository lookup errors', async () => {
      const databaseError = new Error('Database query failed');

      findById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          id: 'endpoint-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBe(databaseError);

      expect(update).not.toHaveBeenCalled();
    });

    it('should propagate duplicate lookup errors', async () => {
      const databaseError = new Error('Database query failed');

      findByApiDefinitionIdAndMethodAndPath.mockRejectedValue(
        databaseError,
      );

      await expect(
        useCase.execute({
          id: 'endpoint-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBe(databaseError);

      expect(update).not.toHaveBeenCalled();
    });

    it('should propagate repository update errors', async () => {
      const databaseError = new Error('Database unavailable');

      update.mockRejectedValue(databaseError);

      await expect(
        useCase.execute({
          id: 'endpoint-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).rejects.toBe(databaseError);
    });
  });
});
