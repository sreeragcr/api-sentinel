
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaRestRequestConfigurationRepository } from './prisma-rest-request-configuration.repository.js';

import type { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import {
  RestRequestConfiguration,
} from '../../domain/entities/rest-request-configuration.entity.js';

import {
  AuthenticationType,
} from '../../domain/enums/authentication-type.enum.js';

import {
  RequestBodyType,
} from '../../domain/enums/request-body-type.enum.js';

describe('PrismaRestRequestConfigurationRepository', () => {
  const upsert = vi.fn();
  const findUnique = vi.fn();

  const prisma = {
    restRequestConfiguration: {
      upsert,
      findUnique,
    },
  };

  let repository: PrismaRestRequestConfigurationRepository;

  const createConfiguration = (): RestRequestConfiguration =>
    RestRequestConfiguration.create({
      id: 'config-123',
      endpointId: 'endpoint-123',
      queryParameters: [
        {
          key: 'page',
          value: '1',
          enabled: true,
        },
      ],
      pathParameters: [
        {
          key: 'userId',
          value: '123',
          enabled: true,
        },
      ],
      headers: [
        {
          key: 'Content-Type',
          value: 'application/json',
          enabled: true,
        },
      ],
      authentication: {
        type: AuthenticationType.BEARER,
        credentialReference: 'secret-123',
      },
      body: {
        type: RequestBodyType.JSON,
        content: '{"name":"John"}',
      },
    });

  const createRecord = () => {
    const configuration = createConfiguration();

    return {
      id: configuration.id,
      endpointId: configuration.endpointId,
      queryParameters: configuration.queryParameters,
      pathParameters: configuration.pathParameters,
      headers: configuration.headers,
      authentication: configuration.authentication,
      body: configuration.body,
      createdAt: configuration.createdAt,
      updatedAt: configuration.updatedAt,
    };
  };

  beforeEach(() => {
    upsert.mockReset();
    findUnique.mockReset();

    repository = new PrismaRestRequestConfigurationRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('save()', () => {
    it('should create and return a request configuration successfully', async () => {
      const configuration = createConfiguration();
      const record = createRecord();

      upsert.mockResolvedValue(record);

      const result = await repository.save(configuration);

      expect(result).toBeInstanceOf(RestRequestConfiguration);
      expect(result.id).toBe(configuration.id);
      expect(result.endpointId).toBe(configuration.endpointId);
      expect(result.queryParameters).toEqual(
        configuration.queryParameters,
      );
      expect(result.pathParameters).toEqual(
        configuration.pathParameters,
      );
      expect(result.headers).toEqual(configuration.headers);
      expect(result.authentication).toEqual(
        configuration.authentication,
      );
      expect(result.body).toEqual(configuration.body);

      expect(upsert).toHaveBeenCalledWith({
        where: {
          endpointId: configuration.endpointId,
        },
        create: {
          id: configuration.id,
          endpointId: configuration.endpointId,
          queryParameters: configuration.queryParameters,
          pathParameters: configuration.pathParameters,
          headers: configuration.headers,
          authentication: configuration.authentication,
          body: configuration.body,
          createdAt: configuration.createdAt,
          updatedAt: configuration.updatedAt,
        },
        update: {
          queryParameters: configuration.queryParameters,
          pathParameters: configuration.pathParameters,
          headers: configuration.headers,
          authentication: configuration.authentication,
          body: configuration.body,
          updatedAt: configuration.updatedAt,
        },
      });

      expect(upsert).toHaveBeenCalledOnce();
    });

    it('should update an existing request configuration using upsert', async () => {
      const configuration = createConfiguration().update({
        queryParameters: [
          {
            key: 'page',
            value: '2',
            enabled: true,
          },
        ],
        pathParameters: [],
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

      const record = {
        id: configuration.id,
        endpointId: configuration.endpointId,
        queryParameters: configuration.queryParameters,
        pathParameters: configuration.pathParameters,
        headers: configuration.headers,
        authentication: configuration.authentication,
        body: configuration.body,
        createdAt: configuration.createdAt,
        updatedAt: configuration.updatedAt,
      };

      upsert.mockResolvedValue(record);

      const result = await repository.save(configuration);

      expect(result).toBeInstanceOf(RestRequestConfiguration);
      expect(result.id).toBe(configuration.id);
      expect(result.endpointId).toBe(configuration.endpointId);
      expect(result.queryParameters[0].value).toBe('2');
      expect(result.authentication.type).toBe(
        AuthenticationType.NONE,
      );

      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            endpointId: configuration.endpointId,
          },
          update: expect.objectContaining({
            queryParameters: configuration.queryParameters,
            headers: configuration.headers,
            authentication: configuration.authentication,
            body: configuration.body,
          }),
        }),
      );
    });

    it('should propagate unexpected database errors', async () => {
      const configuration = createConfiguration();
      const databaseError = new Error('Database unavailable');

      upsert.mockRejectedValue(databaseError);

      await expect(
        repository.save(configuration),
      ).rejects.toBe(databaseError);

      expect(upsert).toHaveBeenCalledOnce();
    });
  });

  describe('findByEndpointId()', () => {
    it('should return a request configuration when found', async () => {
      const record = createRecord();

      findUnique.mockResolvedValue(record);

      const result = await repository.findByEndpointId(
        'endpoint-123',
      );

      expect(result).toBeInstanceOf(RestRequestConfiguration);
      expect(result?.id).toBe('config-123');
      expect(result?.endpointId).toBe('endpoint-123');
      expect(result?.queryParameters).toEqual(
        record.queryParameters,
      );
      expect(result?.pathParameters).toEqual(
        record.pathParameters,
      );
      expect(result?.headers).toEqual(record.headers);
      expect(result?.authentication).toEqual(
        record.authentication,
      );
      expect(result?.body).toEqual(record.body);

      expect(findUnique).toHaveBeenCalledWith({
        where: {
          endpointId: 'endpoint-123',
        },
      });

      expect(findUnique).toHaveBeenCalledOnce();
    });

    it('should return null when the configuration does not exist', async () => {
      findUnique.mockResolvedValue(null);

      const result = await repository.findByEndpointId(
        'missing-endpoint',
      );

      expect(result).toBeNull();

      expect(findUnique).toHaveBeenCalledWith({
        where: {
          endpointId: 'missing-endpoint',
        },
      });
    });

    it('should propagate database errors', async () => {
      const databaseError = new Error('Database unavailable');

      findUnique.mockRejectedValue(databaseError);

      await expect(
        repository.findByEndpointId('endpoint-123'),
      ).rejects.toBe(databaseError);
    });
  });
});
