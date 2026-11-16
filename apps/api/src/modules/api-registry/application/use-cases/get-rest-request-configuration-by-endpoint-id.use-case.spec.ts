
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GetRestRequestConfigurationByEndpointIdUseCase,
} from './get-rest-request-configuration-by-endpoint-id.use-case.js';

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
  RestRequestConfigurationRepository,
} from '../ports/rest-request-configuration.repository.js';

describe('GetRestRequestConfigurationByEndpointIdUseCase', () => {
  const findByEndpointId =
    vi.fn<RestRequestConfigurationRepository['findByEndpointId']>();

  const restRequestConfigurationRepository:
    RestRequestConfigurationRepository = {
      save: vi.fn(),
      findByEndpointId,
    };

  let useCase: GetRestRequestConfigurationByEndpointIdUseCase;

  beforeEach(() => {
    findByEndpointId.mockReset();

    useCase = new GetRestRequestConfigurationByEndpointIdUseCase(
      restRequestConfigurationRepository,
    );
  });

  describe('execute()', () => {
    it('should return the request configuration when it exists', async () => {
      const configuration = RestRequestConfiguration.create({
        id: 'configuration-123',
        endpointId: 'endpoint-123',
        queryParameters: [
          {
            key: 'page',
            value: '1',
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

      findByEndpointId.mockResolvedValue(configuration);

      const result = await useCase.execute('endpoint-123');

      expect(result).toBe(configuration);

      expect(findByEndpointId).toHaveBeenCalledWith(
        'endpoint-123',
      );
    });

    it('should return null when configuration does not exist', async () => {
      findByEndpointId.mockResolvedValue(null);

      const result = await useCase.execute('endpoint-123');

      expect(result).toBeNull();

      expect(findByEndpointId).toHaveBeenCalledWith(
        'endpoint-123',
      );
    });

    it('should propagate repository errors', async () => {
      const databaseError = new Error('Database unavailable');

      findByEndpointId.mockRejectedValue(databaseError);

      await expect(
        useCase.execute('endpoint-123'),
      ).rejects.toBe(databaseError);
    });
  });
});
