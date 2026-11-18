
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Credential } from '../../domain/entities/credential.entity.js';
import { CredentialType } from '../../domain/enums/credential-type.enum.js';

import { CredentialNotFoundError } from '../errors/credential-not-found.error.js';
import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';

import type { CredentialRepository } from '../ports/credential.repository.js';
import type { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

import { GetCredentialByIdUseCase } from './get-credential-by-id.use-case.js';

describe('GetCredentialByIdUseCase', () => {
  const findById = vi.fn();
  const existsById = vi.fn();

  const credentialRepository = {
    findById,
  };

  const workspaceExistenceChecker = {
    existsById,
  };

  let useCase: GetCredentialByIdUseCase;

  const input = {
    credentialId: 'credential-123',
    workspaceId: 'workspace-123',
  };

  const createCredential = () =>
    Credential.create({
      id: 'credential-123',
      workspaceId: 'workspace-123',
      name: 'Production API',
      type: CredentialType.BEARER,
      encryptedValue: 'encrypted-value',
    });

  beforeEach(() => {
    findById.mockReset();
    existsById.mockReset();

    existsById.mockResolvedValue(true);
    findById.mockResolvedValue(createCredential());

    useCase = new GetCredentialByIdUseCase(
      credentialRepository as unknown as CredentialRepository,
      workspaceExistenceChecker as unknown as WorkspaceExistenceChecker,
    );
  });

  it('gets a credential successfully', async () => {
    const result = await useCase.execute(input);

    expect(result).toMatchObject({
      id: 'credential-123',
      workspaceId: 'workspace-123',
      name: 'Production API',
      type: CredentialType.BEARER,
      encryptedValue: 'encrypted-value',
    });

    expect(existsById).toHaveBeenCalledWith('workspace-123');

    expect(findById).toHaveBeenCalledWith(
      'credential-123',
      'workspace-123',
    );
  });

  it('rejects retrieval when the workspace does not exist', async () => {
    existsById.mockResolvedValue(false);

    await expect(
      useCase.execute(input),
    ).rejects.toBeInstanceOf(WorkspaceNotFoundError);

    expect(findById).not.toHaveBeenCalled();
  });

  it('rejects retrieval when the credential does not exist', async () => {
    findById.mockResolvedValue(null);

    await expect(
      useCase.execute(input),
    ).rejects.toBeInstanceOf(CredentialNotFoundError);
  });

  it('propagates repository errors', async () => {
    const error = new Error('Database unavailable');

    findById.mockRejectedValue(error);

    await expect(
      useCase.execute(input),
    ).rejects.toBe(error);
  });

  it('does not retrieve a credential before validating its workspace', async () => {
    existsById.mockResolvedValue(false);

    await expect(
      useCase.execute(input),
    ).rejects.toBeInstanceOf(WorkspaceNotFoundError);

    expect(findById).not.toHaveBeenCalled();
  });
});
