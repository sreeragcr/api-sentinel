
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Credential } from '../../domain/entities/credential.entity.js';
import { CredentialType } from '../../domain/enums/credential-type.enum.js';

import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';

import type { CredentialRepository } from '../ports/credential.repository.js';
import type { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

import { GetCredentialsByWorkspaceUseCase } from './get-credentials-by-workspace.use-case.js';

describe('GetCredentialsByWorkspaceUseCase', () => {
  const findByWorkspaceId = vi.fn();
  const existsById = vi.fn();

  const credentialRepository = {
    findByWorkspaceId,
  };

  const workspaceExistenceChecker = {
    existsById,
  };

  let useCase: GetCredentialsByWorkspaceUseCase;

  const workspaceId = 'workspace-123';

  const createCredential = (
    id: string,
    name: string,
    type: CredentialType,
  ) =>
    Credential.create({
      id,
      workspaceId,
      name,
      type,
      encryptedValue: 'encrypted-value',
    });

  beforeEach(() => {
    findByWorkspaceId.mockReset();
    existsById.mockReset();

    existsById.mockResolvedValue(true);
    findByWorkspaceId.mockResolvedValue([]);

    useCase = new GetCredentialsByWorkspaceUseCase(
      credentialRepository as unknown as CredentialRepository,
      workspaceExistenceChecker as unknown as WorkspaceExistenceChecker,
    );
  });

  it('gets all credentials belonging to a workspace', async () => {
    const credentials = [
      createCredential(
        'credential-123',
        'Production Bearer',
        CredentialType.BEARER,
      ),
      createCredential(
        'credential-456',
        'Production Basic Auth',
        CredentialType.BASIC,
      ),
      createCredential(
        'credential-789',
        'Production API Key',
        CredentialType.API_KEY,
      ),
    ];

    findByWorkspaceId.mockResolvedValue(credentials);

    const result = await useCase.execute(workspaceId);

    expect(result).toHaveLength(3);
    expect(result[0].type).toBe(CredentialType.BEARER);
    expect(result[1].type).toBe(CredentialType.BASIC);
    expect(result[2].type).toBe(CredentialType.API_KEY);

    expect(existsById).toHaveBeenCalledWith(workspaceId);
    expect(findByWorkspaceId).toHaveBeenCalledWith(workspaceId);
  });

  it('returns an empty array when the workspace has no credentials', async () => {
    findByWorkspaceId.mockResolvedValue([]);

    const result = await useCase.execute(workspaceId);

    expect(result).toEqual([]);
    expect(findByWorkspaceId).toHaveBeenCalledWith(workspaceId);
  });

  it('rejects retrieval when the workspace does not exist', async () => {
    existsById.mockResolvedValue(false);

    await expect(
      useCase.execute(workspaceId),
    ).rejects.toBeInstanceOf(WorkspaceNotFoundError);

    expect(findByWorkspaceId).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const error = new Error('Database unavailable');

    findByWorkspaceId.mockRejectedValue(error);

    await expect(
      useCase.execute(workspaceId),
    ).rejects.toBe(error);
  });
});
