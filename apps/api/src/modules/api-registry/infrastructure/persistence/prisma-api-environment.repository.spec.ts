import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';
import { ApiEnvironmentNotFoundError } from '../../application/errors/api-environment-not-found.error.js';
import { DuplicateApiEnvironmentError } from '../../application/errors/duplicate-api-environment.error.js';
import { ApiEnvironment } from '../../domain/entities/api-environment.entity.js';
import { PrismaApiEnvironmentRepository } from './prisma-api-environment.repository.js';

describe('PrismaApiEnvironmentRepository', () => {
  const create = vi.fn();
  const update = vi.fn();
  const remove = vi.fn();
  const findUnique = vi.fn();
  const findMany = vi.fn();
  const prisma = {
    apiEnvironment: { create, update, delete: remove, findUnique, findMany },
  };
  let repository: PrismaApiEnvironmentRepository;

  const environment = () =>
    ApiEnvironment.create({
      id: 'environment-123',
      apiDefinitionId: 'api-definition-123',
      name: 'Development',
      baseUrl: 'https://dev.example.com',
      description: 'Dev server',
    });
  const record = () => {
    const value = environment();
    return {
      id: value.id,
      apiDefinitionId: value.apiDefinitionId,
      name: value.name,
      baseUrl: value.baseUrl,
      description: value.description,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  };

  beforeEach(() => {
    [create, update, remove, findUnique, findMany].forEach((method) =>
      method.mockReset(),
    );
    repository = new PrismaApiEnvironmentRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('persists environments and maps unique constraint violations', async () => {
    create.mockResolvedValue(record());
    await expect(repository.save(environment())).resolves.toMatchObject({
      baseUrl: 'https://dev.example.com',
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        apiDefinitionId: 'api-definition-123',
        name: 'Development',
      }),
    });
    create.mockRejectedValue({ code: 'P2002' });
    await expect(repository.save(environment())).rejects.toBeInstanceOf(
      DuplicateApiEnvironmentError,
    );
  });

  it('retrieves by ID, composite name, and API definition', async () => {
    findUnique.mockResolvedValueOnce(record()).mockResolvedValueOnce(record());
    findMany.mockResolvedValue([record()]);
    await expect(repository.findById('environment-123')).resolves.toMatchObject(
      { id: 'environment-123' },
    );
    await expect(
      repository.findByApiDefinitionIdAndName(
        'api-definition-123',
        'Development',
      ),
    ).resolves.toMatchObject({ name: 'Development' });
    await expect(
      repository.findByApiDefinitionId('api-definition-123'),
    ).resolves.toHaveLength(1);
  });

  it('updates and deletes environments, mapping record-not-found errors', async () => {
    update.mockResolvedValue(record());
    await expect(repository.update(environment())).resolves.toMatchObject({
      id: 'environment-123',
    });
    remove.mockResolvedValue(record());
    await expect(repository.delete('environment-123')).resolves.toBeUndefined();
    update.mockRejectedValue({ code: 'P2025' });
    await expect(repository.update(environment())).rejects.toBeInstanceOf(
      ApiEnvironmentNotFoundError,
    );
    remove.mockRejectedValue({ code: 'P2025' });
    await expect(repository.delete('missing')).rejects.toBeInstanceOf(
      ApiEnvironmentNotFoundError,
    );
  });

  it('propagates unexpected database errors', async () => {
    const error = new Error('Database unavailable');
    create.mockRejectedValue(error);
    await expect(repository.save(environment())).rejects.toBe(error);
  });
});
