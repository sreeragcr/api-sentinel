
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DeleteRestEndpointUseCase } from './delete-rest-endpoint.use-case.js';

import { RestEndpoint } from '../../domain/entities/rest-endpoint.entity.js';
import { HttpMethod } from '../../domain/enums/http-method.enum.js';

import type { RestEndpointRepository } from '../ports/rest-endpoint.repository.js';

import { RestEndpointNotFoundError } from '../errors/rest-endpoint-not-found.error.js';

describe('DeleteRestEndpointUseCase', () => {
  const findById = vi.fn();
  const deleteEndpoint = vi.fn();

  let useCase: DeleteRestEndpointUseCase;

  const existingEndpoint = RestEndpoint.create({
    id: 'endpoint-123',
    apiDefinitionId: 'api-definition-123',
    name: 'Get Users',
    description: 'Retrieve all users',
    method: HttpMethod.GET,
    path: '/users',
  });

  beforeEach(() => {
    findById.mockReset();
    deleteEndpoint.mockReset();

    const repository = {
      findById,
      delete: deleteEndpoint,
    } as unknown as RestEndpointRepository;

    useCase = new DeleteRestEndpointUseCase(repository);
  });

  it('should delete an existing REST endpoint successfully', async () => {
    findById.mockResolvedValue(existingEndpoint);
    deleteEndpoint.mockResolvedValue(undefined);

    await expect(
      useCase.execute('endpoint-123'),
    ).resolves.toBeUndefined();

    expect(findById).toHaveBeenCalledWith('endpoint-123');
    expect(deleteEndpoint).toHaveBeenCalledWith('endpoint-123');
  });

  it('should throw RestEndpointNotFoundError when endpoint does not exist', async () => {
    findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-endpoint'),
    ).rejects.toBeInstanceOf(RestEndpointNotFoundError);

    expect(deleteEndpoint).not.toHaveBeenCalled();
  });

  it('should propagate repository lookup errors', async () => {
    const databaseError = new Error('Database unavailable');

    findById.mockRejectedValue(databaseError);

    await expect(
      useCase.execute('endpoint-123'),
    ).rejects.toBe(databaseError);

    expect(deleteEndpoint).not.toHaveBeenCalled();
  });

  it('should propagate repository deletion errors', async () => {
    const databaseError = new Error('Database unavailable');

    findById.mockResolvedValue(existingEndpoint);
    deleteEndpoint.mockRejectedValue(databaseError);

    await expect(
      useCase.execute('endpoint-123'),
    ).rejects.toBe(databaseError);
  });
});
