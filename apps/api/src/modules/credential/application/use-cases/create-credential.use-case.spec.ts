
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Credential } from '../../domain/entities/credential.entity.js';
import { CredentialType } from '../../domain/enums/credential-type.enum.js';
import type { CredentialValue } from '../../domain/types/credential-value.type.js';

import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';
import { DuplicateCredentialError } from '../errors/duplicate-credential.error.js';

import type { CredentialRepository } from '../ports/credential.repository.js';
import type { CredentialEncryptionPort } from '../ports/credential-encryption.port.js';
import type { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

import { CreateCredentialUseCase } from './create-credential.use-case.js';

describe('CreateCredentialUseCase', () => {
  const save = vi.fn();
  const findByWorkspaceIdAndName = vi.fn();
  const encrypt = vi.fn();
  const existsById = vi.fn();

  const credentialRepository = {
    save,
    findByWorkspaceIdAndName,
  };

  const encryption = {
    encrypt,
  };

  const workspaceExistenceChecker = {
    existsById,
  };

  let useCase: CreateCredentialUseCase;

  const input = (
    value: CredentialValue = {
      type: CredentialType.BEARER,
      token: 'my-secret-token',
    },
  ) => ({
    workspaceId: 'workspace-123',
    name: 'Production API',
    value,
  });

  const createCredential = () =>
    Credential.create({
      id: 'credential-123',
      workspaceId: 'workspace-123',
      name: 'Production API',
      type: CredentialType.BEARER,
      encryptedValue: 'encrypted-value',
    });

  beforeEach(() => {
    [save, findByWorkspaceIdAndName, encrypt, existsById].forEach((method) =>
      method.mockReset(),
    );

    existsById.mockResolvedValue(true);
    findByWorkspaceIdAndName.mockResolvedValue(null);
    encrypt.mockReturnValue('encrypted-value');
    save.mockImplementation(async (credential: Credential) => credential);

    useCase = new CreateCredentialUseCase(
      credentialRepository as unknown as CredentialRepository,
      encryption as unknown as CredentialEncryptionPort,
      workspaceExistenceChecker as unknown as WorkspaceExistenceChecker,
    );
  });

  it('creates a Bearer credential successfully', async () => {
    const result = await useCase.execute(input());

    expect(result).toMatchObject({
      workspaceId: 'workspace-123',
      name: 'Production API',
      type: CredentialType.BEARER,
      encryptedValue: 'encrypted-value',
    });

    expect(existsById).toHaveBeenCalledWith('workspace-123');

    expect(findByWorkspaceIdAndName).toHaveBeenCalledWith(
      'workspace-123',
      'Production API',
    );

    expect(encrypt).toHaveBeenCalledWith(
      JSON.stringify({
        type: CredentialType.BEARER,
        token: 'my-secret-token',
      }),
    );

    expect(save).toHaveBeenCalledOnce();
  });

  it('creates a Basic Authentication credential successfully', async () => {
    const value: CredentialValue = {
      type: CredentialType.BASIC,
      username: 'api-user',
      password: 'my-password',
    };

    const result = await useCase.execute(input(value));

    expect(result.type).toBe(CredentialType.BASIC);

    expect(encrypt).toHaveBeenCalledWith(JSON.stringify(value));
    expect(save).toHaveBeenCalledOnce();
  });

  it('creates an API Key credential successfully', async () => {
    const value: CredentialValue = {
      type: CredentialType.API_KEY,
      value: 'my-api-key',
    };

    const result = await useCase.execute(input(value));

    expect(result.type).toBe(CredentialType.API_KEY);

    expect(encrypt).toHaveBeenCalledWith(JSON.stringify(value));
    expect(save).toHaveBeenCalledOnce();
  });

  it('rejects creation when the workspace does not exist', async () => {
    existsById.mockResolvedValue(false);

    await expect(useCase.execute(input())).rejects.toBeInstanceOf(
      WorkspaceNotFoundError,
    );

    expect(findByWorkspaceIdAndName).not.toHaveBeenCalled();
    expect(encrypt).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('rejects duplicate credential names', async () => {
    findByWorkspaceIdAndName.mockResolvedValue(createCredential());

    await expect(useCase.execute(input())).rejects.toBeInstanceOf(
      DuplicateCredentialError,
    );

    expect(encrypt).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('trims the credential name before checking and saving', async () => {
    await useCase.execute({
      ...input(),
      name: '  Production API  ',
    });

    expect(findByWorkspaceIdAndName).toHaveBeenCalledWith(
      'workspace-123',
      'Production API',
    );

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Production API',
      }),
    );
  });

  it('propagates encryption errors', async () => {
    const error = new Error('Encryption failed');
    encrypt.mockImplementation(() => {
      throw error;
    });

    await expect(useCase.execute(input())).rejects.toBe(error);

    expect(save).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const error = new Error('Database unavailable');
    save.mockRejectedValue(error);

    await expect(useCase.execute(input())).rejects.toBe(error);
  });
});
