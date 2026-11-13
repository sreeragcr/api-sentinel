
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaRestEndpointRepository } from './prisma-rest-endpoint.repository.js';

import type { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { RestEndpoint } from '../../domain/entities/rest-endpoint.entity.js';

import { HttpMethod } from '../../domain/enums/http-method.enum.js';

import { DuplicateRestEndpointError } from '../../application/errors/duplicate-rest-endpoint.error.js';

import { ApiDefinitionNotFoundError } from '../../application/errors/api-definition-not-found.error.js';

import { RestEndpointNotFoundError } from '../../application/errors/rest-endpoint-not-found.error.js';

describe('PrismaRestEndpointRepository', () => {
  const create = vi.fn();
  const update = vi.fn();
  const deleteEndpoint = vi.fn();
  const findUnique = vi.fn();
  const findMany = vi.fn();
  const count = vi.fn();

  const prisma = {
    restEndpoint: {
      create,
      update,
      delete: deleteEndpoint,
      findUnique,
      findMany,
      count,
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
    update.mockReset();
    deleteEndpoint.mockReset();
    findUnique.mockReset();
    findMany.mockReset();
    count.mockReset();

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

  describe('update()', () => {
    it('should update and return a REST endpoint successfully', async () => {
      const endpoint = createEndpoint().update({
        name: 'Get All Users',
        description: 'Retrieve all registered users',
        method: HttpMethod.GET,
        path: '/users',
      });

      const record = {
        id: endpoint.id,
        apiDefinitionId: endpoint.apiDefinitionId,
        name: endpoint.name,
        description: endpoint.description,
        method: endpoint.method,
        path: endpoint.path,
        createdAt: endpoint.createdAt,
        updatedAt: endpoint.updatedAt,
      };

      update.mockResolvedValue(record);

      const result = await repository.update(endpoint);

      expect(result).toBeInstanceOf(RestEndpoint);
      expect(result.id).toBe(endpoint.id);
      expect(result.name).toBe('Get All Users');
      expect(result.description).toBe(
        'Retrieve all registered users',
      );
      expect(result.method).toBe(HttpMethod.GET);
      expect(result.path).toBe('/users');

      expect(update).toHaveBeenCalledWith({
        where: {
          id: endpoint.id,
        },
        data: {
          name: endpoint.name,
          description: endpoint.description,
          method: HttpMethod.GET,
          path: endpoint.path,
        },
      });
    });

    it('should map Prisma P2002 to DuplicateRestEndpointError', async () => {
      const endpoint = createEndpoint().update({
        name: 'Create User',
        description: 'Create a new user',
        method: HttpMethod.POST,
        path: '/users',
      });

      update.mockRejectedValue({
        code: 'P2002',
      });

      await expect(
        repository.update(endpoint),
      ).rejects.toBeInstanceOf(DuplicateRestEndpointError);

      expect(update).toHaveBeenCalledOnce();
    });

    it('should map Prisma P2025 to RestEndpointNotFoundError', async () => {
      const endpoint = createEndpoint();

      update.mockRejectedValue({
        code: 'P2025',
      });

      await expect(
        repository.update(endpoint),
      ).rejects.toMatchObject({
        name: 'RestEndpointNotFoundError',
      });

      expect(update).toHaveBeenCalledOnce();
    });

    it('should propagate unexpected database errors', async () => {
      const endpoint = createEndpoint();
      const databaseError = new Error('Database unavailable');

      update.mockRejectedValue(databaseError);

      await expect(
        repository.update(endpoint),
      ).rejects.toBe(databaseError);
    });
  });


  describe('delete()', () => {
    it('should delete a REST endpoint successfully', async () => {
      deleteEndpoint.mockResolvedValue(createRecord());

      await expect(
        repository.delete('endpoint-123'),
      ).resolves.toBeUndefined();

      expect(deleteEndpoint).toHaveBeenCalledWith({
        where: {
          id: 'endpoint-123',
        },
      });

      expect(deleteEndpoint).toHaveBeenCalledOnce();
    });

    it('should map Prisma P2025 to RestEndpointNotFoundError', async () => {
      deleteEndpoint.mockRejectedValue({
        code: 'P2025',
      });

      await expect(
        repository.delete('missing-endpoint'),
      ).rejects.toBeInstanceOf(RestEndpointNotFoundError);

      expect(deleteEndpoint).toHaveBeenCalledOnce();
    });

    it('should propagate unexpected database errors', async () => {
      const databaseError = new Error('Database unavailable');

      deleteEndpoint.mockRejectedValue(databaseError);

      await expect(
        repository.delete('endpoint-123'),
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

  describe('findByApiDefinitionId()', () => {
    it('should return paginated endpoints and total count', async () => {
      const records = [
        createRecord(),
        {
          ...createRecord(),
          id: 'endpoint-456',
          name: 'Create User',
          method: HttpMethod.POST,
          path: '/users',
        },
      ];

      findMany.mockResolvedValue(records);
      count.mockResolvedValue(5);

      const result = await repository.findByApiDefinitionId(
        'api-definition-123',
        {
          offset: 0,
          limit: 2,
        },
      );

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toBeInstanceOf(RestEndpoint);
      expect(result.items[0].id).toBe('endpoint-123');
      expect(result.items[1].id).toBe('endpoint-456');
      expect(result.totalCount).toBe(5);

      expect(findMany).toHaveBeenCalledWith({
        where: {
          apiDefinitionId: 'api-definition-123',
        },
        skip: 0,
        take: 2,
        orderBy: [
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
      });

      expect(count).toHaveBeenCalledWith({
        where: {
          apiDefinitionId: 'api-definition-123',
        },
      });
    });

    it('should return an empty list when no endpoints exist', async () => {
      findMany.mockResolvedValue([]);
      count.mockResolvedValue(0);

      const result = await repository.findByApiDefinitionId(
        'api-definition-123',
        {
          offset: 0,
          limit: 20,
        },
      );

      expect(result).toEqual({
        items: [],
        totalCount: 0,
      });
    });

    it('should propagate database errors', async () => {
      const databaseError = new Error('Database unavailable');

      findMany.mockRejectedValue(databaseError);
      count.mockResolvedValue(0);

      await expect(
        repository.findByApiDefinitionId(
          'api-definition-123',
          {
            offset: 0,
            limit: 20,
          },
        ),
      ).rejects.toBe(databaseError);
    });
  });
});
