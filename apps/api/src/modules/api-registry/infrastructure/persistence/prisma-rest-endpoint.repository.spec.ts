
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaRestEndpointRepository } from './prisma-rest-endpoint.repository.js';

import type { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { RestEndpoint } from '../../domain/entities/rest-endpoint.entity.js';

import { HttpMethod } from '../../domain/enums/http-method.enum.js';

import { DuplicateRestEndpointError } from '../../application/errors/duplicate-rest-endpoint.error.js';

import { ApiDefinitionNotFoundError } from '../../application/errors/api-definition-not-found.error.js';

describe('PrismaRestEndpointRepository', () => {
  const create = vi.fn();
  const findUnique = vi.fn();

  const prisma = {
    restEndpoint: {
      create,
      findUnique,
    },
  };

  let repository: PrismaRestEndpointRepository;

  const createEndpoint = (): RestEndpoint =>
    RestEndpoint.create({
      id: 'endpoint-123',
      apiDefinitionId: 'api-definition-123',
      name: 'Get Users',
      description: 'Retrieve all users',
      method: HttpMethod.GET,
      path: '/users',
    });

  const createRecord = () => {
    const endpoint = createEndpoint();

    return {
      id: endpoint.id,
      apiDefinitionId: endpoint.apiDefinitionId,
      name: endpoint.name,
      description: endpoint.description,
      method: endpoint.method,
      path: endpoint.path,
      createdAt: endpoint.createdAt,
      updatedAt: endpoint.updatedAt,
    };
  };

  beforeEach(() => {
    create.mockReset();
    findUnique.mockReset();

    repository = new PrismaRestEndpointRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('save()', () => {
    it('should save and return a REST endpoint successfully', async () => {
      const endpoint = createEndpoint();
      const record = createRecord();

      create.mockResolvedValue(record);

      const result = await repository.save(endpoint);

      expect(result).toBeInstanceOf(RestEndpoint);
      expect(result.id).toBe(endpoint.id);
      expect(result.apiDefinitionId).toBe(endpoint.apiDefinitionId);
      expect(result.name).toBe(endpoint.name);
      expect(result.description).toBe(endpoint.description);
      expect(result.method).toBe(endpoint.method);
      expect(result.path).toBe(endpoint.path);

      expect(create).toHaveBeenCalledWith({
        data: {
          id: endpoint.id,
          apiDefinitionId: endpoint.apiDefinitionId,
          name: endpoint.name,
          description: endpoint.description,
          method: HttpMethod.GET,
          path: endpoint.path,
          createdAt: endpoint.createdAt,
          updatedAt: endpoint.updatedAt,
        },
      });
    });

    it('should map Prisma P2002 to DuplicateRestEndpointError', async () => {
      const endpoint = createEndpoint();

      create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(
        repository.save(endpoint),
      ).rejects.toBeInstanceOf(DuplicateRestEndpointError);

      expect(create).toHaveBeenCalledOnce();
    });

    it('should map Prisma P2003 to ApiDefinitionNotFoundError', async () => {
      const endpoint = createEndpoint();

      create.mockRejectedValue({
        code: 'P2003',
      });

      await expect(
        repository.save(endpoint),
      ).rejects.toBeInstanceOf(ApiDefinitionNotFoundError);

      expect(create).toHaveBeenCalledOnce();
    });

    it('should propagate unexpected database errors', async () => {
      const endpoint = createEndpoint();
      const databaseError = new Error('Database unavailable');

      create.mockRejectedValue(databaseError);

      await expect(
        repository.save(endpoint),
      ).rejects.toBe(databaseError);
    });
  });

  describe('findById()', () => {
    it('should return a REST endpoint when found', async () => {
      const record = createRecord();

      findUnique.mockResolvedValue(record);

      const result = await repository.findById('endpoint-123');

      expect(result).toBeInstanceOf(RestEndpoint);
      expect(result?.id).toBe('endpoint-123');
      expect(result?.name).toBe('Get Users');
      expect(result?.method).toBe(HttpMethod.GET);

      expect(findUnique).toHaveBeenCalledWith({
        where: {
          id: 'endpoint-123',
        },
      });
    });

    it('should return null when the endpoint does not exist', async () => {
      findUnique.mockResolvedValue(null);

      const result = await repository.findById('missing-endpoint');

      expect(result).toBeNull();
    });
  });

  describe('findByApiDefinitionIdAndMethodAndPath()', () => {
    it('should return the matching REST endpoint', async () => {
      const record = createRecord();

      findUnique.mockResolvedValue(record);

      const result =
        await repository.findByApiDefinitionIdAndMethodAndPath(
          'api-definition-123',
          HttpMethod.GET,
          '/users',
        );

      expect(result).toBeInstanceOf(RestEndpoint);
      expect(result?.id).toBe('endpoint-123');
      expect(result?.method).toBe(HttpMethod.GET);
      expect(result?.path).toBe('/users');

      expect(findUnique).toHaveBeenCalledWith({
        where: {
          apiDefinitionId_method_path: {
            apiDefinitionId: 'api-definition-123',
            method: HttpMethod.GET,
            path: '/users',
          },
        },
      });
    });

    it('should return null when no matching endpoint exists', async () => {
      findUnique.mockResolvedValue(null);

      const result =
        await repository.findByApiDefinitionIdAndMethodAndPath(
          'api-definition-123',
          HttpMethod.POST,
          '/users',
        );

      expect(result).toBeNull();
    });
  });
});
