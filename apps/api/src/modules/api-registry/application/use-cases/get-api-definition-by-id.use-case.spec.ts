
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GetApiDefinitionByIdUseCase } from './get-api-definition-by-id.use-case.js';

import { ApiDefinition } from '../../domain/entities/api-definition.entity.js';

import { ApiProtocol } from '../../domain/enums/api-protocol.enum.js';

import type {
  ApiDefinitionRepository,
} from '../ports/api-definition.repository.js';

import {
  ApiDefinitionNotFoundError,
} from '../errors/api-definition-not-found.error.js';

describe('GetApiDefinitionByIdUseCase', () => {
  const findById = vi.fn<ApiDefinitionRepository['findById']>();

  const apiDefinitionRepository: ApiDefinitionRepository = {
    save: vi.fn(),
    findById,
    findByProjectIdAndName: vi.fn(),
    findByProjectId: vi.fn(),
  };

  let useCase: GetApiDefinitionByIdUseCase;

  beforeEach(() => {
    findById.mockReset();

    useCase = new GetApiDefinitionByIdUseCase(
      apiDefinitionRepository,
    );
  });

  describe('execute()', () => {
    it('should return an API definition when it exists', async () => {
      const apiDefinition = ApiDefinition.create({
        id: 'api-definition-123',
        projectId: 'project-123',
        name: 'User API',
        protocol: ApiProtocol.REST,
      });

      findById.mockResolvedValue(apiDefinition);

      const result = await useCase.execute('api-definition-123');

      expect(result).toBe(apiDefinition);
      expect(findById).toHaveBeenCalledWith('api-definition-123');
    });

    it('should throw ApiDefinitionNotFoundError when it does not exist', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute('missing-api-definition'),
      ).rejects.toBeInstanceOf(ApiDefinitionNotFoundError);

      expect(findById).toHaveBeenCalledWith(
        'missing-api-definition',
      );
    });

    it('should propagate repository errors', async () => {
      const databaseError = new Error('Database unavailable');

      findById.mockRejectedValue(databaseError);

      await expect(
        useCase.execute('api-definition-123'),
      ).rejects.toBe(databaseError);
    });
  });
});
