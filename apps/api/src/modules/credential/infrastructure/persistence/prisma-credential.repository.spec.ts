
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { CredentialNotFoundError } from '../../application/errors/credential-not-found.error.js';
import { DuplicateCredentialError } from '../../application/errors/duplicate-credential.error.js';

import { Credential } from '../../domain/entities/credential.entity.js';
import { CredentialType } from '../../domain/enums/credential-type.enum.js';

import { PrismaCredentialRepository } from './prisma-credential.repository.js';

describe('PrismaCredentialRepository', () => {
  const create = vi.fn();
  const update = vi.fn();
  const deleteMany = vi.fn();
  const findFirst = vi.fn();
  const findMany = vi.fn();
  const findUnique = vi.fn();

  const prisma = {
    credential: {
      create,
      update,
      deleteMany,
      findFirst,
      findMany,
      findUnique,
    },
  };

  let repository: PrismaCredentialRepository;

  const credential = () =>
    Credential.create({
      id: 'credential-123',
      workspaceId: 'workspace-123',
      name: 'Production API',
      type: CredentialType.BEARER,
      encryptedValue: 'v1.iv.tag.ciphertext',
    });

  const record = () => {
    const value = credential();

    return {
      id: value.id,
      workspaceId: value.workspaceId,
      name: value.name,
      type: value.type,
      encryptedValue: value.encryptedValue,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
    };
  };

  beforeEach(() => {
    [
      create,
      update,
      deleteMany,
      findFirst,
      findMany,
      findUnique,
    ].forEach((method) => method.mockReset());

    repository = new PrismaCredentialRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('persists credentials and maps unique constraint violations', async () => {
    create.mockResolvedValue(record());

    await expect(repository.save(credential())).resolves.toMatchObject({
      name: 'Production API',
      workspaceId: 'workspace-123',
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workspaceId: 'workspace-123',
        name: 'Production API',
        encryptedValue: 'v1.iv.tag.ciphertext',
      }),
    });

    create.mockRejectedValue({ code: 'P2002' });

    await expect(repository.save(credential())).rejects.toBeInstanceOf(
      DuplicateCredentialError,
    );
  });

  it('updates credentials and maps database errors', async () => {
    update.mockResolvedValue(record());

    await expect(repository.update(credential())).resolves.toMatchObject({
      id: 'credential-123',
    });

    expect(update).toHaveBeenCalledWith({
      where: {
        id: 'credential-123',
        workspaceId: 'workspace-123',
      },
      data: {
        name: 'Production API',
        encryptedValue: 'v1.iv.tag.ciphertext',
      },
    });

    update.mockRejectedValue({ code: 'P2002' });

    await expect(repository.update(credential())).rejects.toBeInstanceOf(
      DuplicateCredentialError,
    );

    update.mockRejectedValue({ code: 'P2025' });

    await expect(repository.update(credential())).rejects.toBeInstanceOf(
      CredentialNotFoundError,
    );
  });

  it('deletes credentials within the specified workspace', async () => {
    deleteMany.mockResolvedValue({ count: 1 });

    await expect(
      repository.delete('credential-123', 'workspace-123'),
    ).resolves.toBeUndefined();

    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        id: 'credential-123',
        workspaceId: 'workspace-123',
      },
    });

    deleteMany.mockResolvedValue({ count: 0 });

    await expect(
      repository.delete('credential-123', 'workspace-123'),
    ).rejects.toBeInstanceOf(CredentialNotFoundError);
  });

  it('retrieves credentials by ID within the specified workspace', async () => {
    findFirst.mockResolvedValue(record());

    await expect(
      repository.findById('credential-123', 'workspace-123'),
    ).resolves.toMatchObject({
      id: 'credential-123',
      workspaceId: 'workspace-123',
    });

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'credential-123',
        workspaceId: 'workspace-123',
      },
    });

    findFirst.mockResolvedValue(null);

    await expect(
      repository.findById('credential-123', 'another-workspace'),
    ).resolves.toBeNull();
  });

  it('retrieves all credentials belonging to a workspace', async () => {
    findMany.mockResolvedValue([record(), record()]);

    await expect(
      repository.findByWorkspaceId('workspace-123'),
    ).resolves.toHaveLength(2);

    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId: 'workspace-123' },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  });

  it('retrieves credentials by workspace and name', async () => {
    findUnique.mockResolvedValue(record());

    await expect(
      repository.findByWorkspaceIdAndName(
        'workspace-123',
        'Production API',
      ),
    ).resolves.toMatchObject({
      name: 'Production API',
    });

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_name: {
          workspaceId: 'workspace-123',
          name: 'Production API',
        },
      },
    });

    findUnique.mockResolvedValue(null);

    await expect(
      repository.findByWorkspaceIdAndName(
        'workspace-123',
        'Missing API',
      ),
    ).resolves.toBeNull();
  });

  it('propagates unexpected database errors', async () => {
    const error = new Error('Database unavailable');

    create.mockRejectedValue(error);

    await expect(repository.save(credential())).rejects.toBe(error);

    update.mockRejectedValue(error);

    await expect(repository.update(credential())).rejects.toBe(error);

    deleteMany.mockRejectedValue(error);

    await expect(
      repository.delete('credential-123', 'workspace-123'),
    ).rejects.toBe(error);
  });
});
