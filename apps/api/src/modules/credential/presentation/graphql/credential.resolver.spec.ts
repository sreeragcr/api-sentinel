
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';

import { CredentialResolver } from './credential.resolver.js';

import type { CreateCredentialUseCase } from '../../application/use-cases/create-credential.use-case.js';
import type { GetCredentialByIdUseCase } from '../../application/use-cases/get-credential-by-id.use-case.js';
import type { GetCredentialsByWorkspaceUseCase } from '../../application/use-cases/get-credentials-by-workspace.use-case.js';
import type { UpdateCredentialUseCase } from '../../application/use-cases/update-credential.use-case.js';

import {
  Credential,
  InvalidCredentialError,
} from '../../domain/entities/credential.entity.js';

import { CredentialType } from '../../domain/enums/credential-type.enum.js';

import { DuplicateCredentialError } from '../../application/errors/duplicate-credential.error.js';
import { CredentialNotFoundError } from '../../application/errors/credential-not-found.error.js';
import { WorkspaceNotFoundError } from '../../application/errors/workspace-not-found.error.js';

describe('CredentialResolver', () => {
  const createExecute = vi.fn<CreateCredentialUseCase['execute']>();
  const getByIdExecute = vi.fn<GetCredentialByIdUseCase['execute']>();
  const getByWorkspaceExecute =
    vi.fn<GetCredentialsByWorkspaceUseCase['execute']>();
  const updateExecute = vi.fn<UpdateCredentialUseCase['execute']>();

  const createCredentialUseCase = {
    execute: createExecute,
  } as unknown as CreateCredentialUseCase;

  const getCredentialByIdUseCase = {
    execute: getByIdExecute,
  } as unknown as GetCredentialByIdUseCase;

  const getCredentialsByWorkspaceUseCase = {
    execute: getByWorkspaceExecute,
  } as unknown as GetCredentialsByWorkspaceUseCase;

  const updateCredentialUseCase = {
    execute: updateExecute,
  } as unknown as UpdateCredentialUseCase;

  let resolver: CredentialResolver;

  const workspaceId = '123e4567-e89b-42d3-a456-426614174000';
  const credentialId = '123e4567-e89b-42d3-a456-426614174001';

  const createCredential = (
    type: CredentialType,
    name = 'Production API Credential',
  ) =>
    Credential.create({
      id: credentialId,
      workspaceId,
      name,
      type,
      encryptedValue: 'encrypted-secret-value',
    });

  beforeEach(() => {
    createExecute.mockReset();
    getByIdExecute.mockReset();
    getByWorkspaceExecute.mockReset();
    updateExecute.mockReset();

    resolver = new CredentialResolver(
      createCredentialUseCase,
      getCredentialByIdUseCase,
      getCredentialsByWorkspaceUseCase,
      updateCredentialUseCase,
    );
  });

  // --------------------------------------------------
  // CREATE BEARER CREDENTIAL MUTATION
  // --------------------------------------------------

  describe('createBearerCredential()', () => {
    const input = {
      workspaceId,
      name: 'Bearer Token',
      token: 'secret-bearer-token',
    };

    it('should create a Bearer credential successfully', async () => {
      const credential = createCredential(CredentialType.BEARER);

      createExecute.mockResolvedValue(credential);

      const result = await resolver.createBearerCredential(input);

      expect(createExecute).toHaveBeenCalledWith({
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.BEARER,
          token: input.token,
        },
      });

      expect(result.id).toBe(credential.id);
      expect(result.type).toBe(CredentialType.BEARER);
      expect(result.name).toBe(credential.name);
    });
  });

  // --------------------------------------------------
  // CREATE BASIC CREDENTIAL MUTATION
  // --------------------------------------------------

  describe('createBasicCredential()', () => {
    const input = {
      workspaceId,
      name: 'Basic Authentication',
      username: 'api-user',
      password: 'secret-password',
    };

    it('should create a Basic credential successfully', async () => {
      const credential = createCredential(CredentialType.BASIC);

      createExecute.mockResolvedValue(credential);

      const result = await resolver.createBasicCredential(input);

      expect(createExecute).toHaveBeenCalledWith({
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.BASIC,
          username: input.username,
          password: input.password,
        },
      });

      expect(result.type).toBe(CredentialType.BASIC);
      expect(result.name).toBe(credential.name);
    });
  });

  // --------------------------------------------------
  // CREATE API KEY CREDENTIAL MUTATION
  // --------------------------------------------------

  describe('createApiKeyCredential()', () => {
    const input = {
      workspaceId,
      name: 'External API Key',
      value: 'secret-api-key',
    };

    it('should create an API Key credential successfully', async () => {
      const credential = createCredential(CredentialType.API_KEY);

      createExecute.mockResolvedValue(credential);

      const result = await resolver.createApiKeyCredential(input);

      expect(createExecute).toHaveBeenCalledWith({
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.API_KEY,
          value: input.value,
        },
      });

      expect(result.type).toBe(CredentialType.API_KEY);
      expect(result.name).toBe(credential.name);
    });
  });

  // --------------------------------------------------
  // UPDATE BEARER CREDENTIAL MUTATION
  // --------------------------------------------------

  describe('updateBearerCredential()', () => {
    const input = {
      credentialId,
      workspaceId,
      name: 'Updated Bearer Token',
      token: 'new-secret-bearer-token',
    };

    it('should update a Bearer credential successfully', async () => {
      const credential = createCredential(
        CredentialType.BEARER,
        input.name,
      );

      updateExecute.mockResolvedValue(credential);

      const result = await resolver.updateBearerCredential(input);

      expect(updateExecute).toHaveBeenCalledWith({
        credentialId: input.credentialId,
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.BEARER,
          token: input.token,
        },
      });

      expect(result.id).toBe(credential.id);
      expect(result.name).toBe(input.name);
      expect(result.type).toBe(CredentialType.BEARER);
    });
  });

  // --------------------------------------------------
  // UPDATE BASIC CREDENTIAL MUTATION
  // --------------------------------------------------

  describe('updateBasicCredential()', () => {
    const input = {
      credentialId,
      workspaceId,
      name: 'Updated Basic Authentication',
      username: 'updated-user',
      password: 'new-secret-password',
    };

    it('should update a Basic credential successfully', async () => {
      const credential = createCredential(
        CredentialType.BASIC,
        input.name,
      );

      updateExecute.mockResolvedValue(credential);

      const result = await resolver.updateBasicCredential(input);

      expect(updateExecute).toHaveBeenCalledWith({
        credentialId: input.credentialId,
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.BASIC,
          username: input.username,
          password: input.password,
        },
      });

      expect(result.id).toBe(credential.id);
      expect(result.name).toBe(input.name);
      expect(result.type).toBe(CredentialType.BASIC);
    });
  });

  // --------------------------------------------------
  // UPDATE API KEY CREDENTIAL MUTATION
  // --------------------------------------------------

  describe('updateApiKeyCredential()', () => {
    const input = {
      credentialId,
      workspaceId,
      name: 'Updated External API Key',
      value: 'new-secret-api-key',
    };

    it('should update an API Key credential successfully', async () => {
      const credential = createCredential(
        CredentialType.API_KEY,
        input.name,
      );

      updateExecute.mockResolvedValue(credential);

      const result = await resolver.updateApiKeyCredential(input);

      expect(updateExecute).toHaveBeenCalledWith({
        credentialId: input.credentialId,
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.API_KEY,
          value: input.value,
        },
      });

      expect(result.id).toBe(credential.id);
      expect(result.name).toBe(input.name);
      expect(result.type).toBe(CredentialType.API_KEY);
    });
  });

  // --------------------------------------------------
  // GET CREDENTIAL BY ID QUERY
  // --------------------------------------------------

  describe('getCredential()', () => {
    it('should retrieve a credential by ID and workspace ID', async () => {
      const credential = createCredential(CredentialType.BEARER);

      getByIdExecute.mockResolvedValue(credential);

      const result = await resolver.getCredential(credentialId, workspaceId);

      expect(getByIdExecute).toHaveBeenCalledWith({
        credentialId,
        workspaceId,
      });

      expect(result.id).toBe(credential.id);
      expect(result.name).toBe(credential.name);
      expect(result.type).toBe(credential.type);
    });

    it('should translate credential not found into GraphQL NOT_FOUND', async () => {
      getByIdExecute.mockRejectedValue(
        new CredentialNotFoundError(credentialId),
      );

      await expect(
        resolver.getCredential(credentialId, workspaceId),
      ).rejects.toMatchObject({
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should translate missing workspace into GraphQL NOT_FOUND', async () => {
      getByIdExecute.mockRejectedValue(
        new WorkspaceNotFoundError(workspaceId),
      );

      await expect(
        resolver.getCredential(credentialId, workspaceId),
      ).rejects.toMatchObject({
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });
  });

  // --------------------------------------------------
  // GET CREDENTIALS BY WORKSPACE QUERY
  // --------------------------------------------------

  describe('getCredentialsByWorkspace()', () => {
    it('should retrieve credentials belonging to a workspace', async () => {
      const credentials = [
        createCredential(CredentialType.BEARER, 'Bearer Token'),
        createCredential(CredentialType.API_KEY, 'API Key'),
      ];

      getByWorkspaceExecute.mockResolvedValue(credentials);

      const result = await resolver.getCredentialsByWorkspace(workspaceId);

      expect(getByWorkspaceExecute).toHaveBeenCalledWith(workspaceId);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe(CredentialType.BEARER);
      expect(result[1].type).toBe(CredentialType.API_KEY);
    });

    it('should translate missing workspace into GraphQL NOT_FOUND', async () => {
      getByWorkspaceExecute.mockRejectedValue(
        new WorkspaceNotFoundError(workspaceId),
      );

      await expect(
        resolver.getCredentialsByWorkspace(workspaceId),
      ).rejects.toMatchObject({
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });
  });

  // --------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------

  describe('error handling', () => {
    const input = {
      workspaceId,
      name: 'Bearer Token',
      token: 'secret-token',
    };

    it('should translate duplicate credential error into GraphQL CONFLICT', async () => {
      createExecute.mockRejectedValue(
        new DuplicateCredentialError(workspaceId, input.name),
      );

      await expect(
        resolver.createBearerCredential(input),
      ).rejects.toMatchObject({
        extensions: {
          code: 'CONFLICT',
        },
      });
    });

    it('should translate duplicate credential errors during update into GraphQL CONFLICT', async () => {
      const updateInput = {
        credentialId,
        workspaceId,
        name: 'Duplicate Credential',
        token: 'new-secret-token',
      };

      updateExecute.mockRejectedValue(
        new DuplicateCredentialError(workspaceId, updateInput.name),
      );

      await expect(
        resolver.updateBearerCredential(updateInput),
      ).rejects.toMatchObject({
        extensions: {
          code: 'CONFLICT',
        },
      });
    });

    it('should translate workspace not found error into GraphQL NOT_FOUND', async () => {
      createExecute.mockRejectedValue(
        new WorkspaceNotFoundError(workspaceId),
      );

      await expect(
        resolver.createBearerCredential(input),
      ).rejects.toMatchObject({
        message: `Workspace "${workspaceId}" was not found`,
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should translate invalid credential error into BadRequestException', async () => {
      createExecute.mockRejectedValue(
        new InvalidCredentialError('Invalid credential name'),
      );

      await expect(
        resolver.createBearerCredential(input),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should propagate unexpected errors', async () => {
      const unexpectedError = new Error('Database unavailable');

      createExecute.mockRejectedValue(unexpectedError);

      await expect(
        resolver.createBearerCredential(input),
      ).rejects.toBe(unexpectedError);
    });
  });

  // --------------------------------------------------
  // SECRET PROTECTION
  // --------------------------------------------------

  describe('secret protection', () => {
    it('should never expose encrypted credential values in create responses', async () => {
      const credential = createCredential(CredentialType.BEARER);

      createExecute.mockResolvedValue(credential);

      const result = await resolver.createBearerCredential({
        workspaceId,
        name: 'Bearer Token',
        token: 'secret-token',
      });

      expect(result).not.toHaveProperty('encryptedValue');
      expect(result).not.toHaveProperty('token');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('value');
    });

    it('should never expose encrypted credential values in retrieval responses', async () => {
      const credential = createCredential(CredentialType.BASIC);

      getByIdExecute.mockResolvedValue(credential);

      const result = await resolver.getCredential(credentialId, workspaceId);

      expect(result).not.toHaveProperty('encryptedValue');
      expect(result).not.toHaveProperty('token');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('value');
    });

    it('should never expose encrypted credential values in update responses', async () => {
      const credential = createCredential(CredentialType.BEARER);

      updateExecute.mockResolvedValue(credential);

      const result = await resolver.updateBearerCredential({
        credentialId,
        workspaceId,
        name: 'Updated Bearer Token',
        token: 'new-secret-token',
      });

      expect(result).not.toHaveProperty('encryptedValue');
      expect(result).not.toHaveProperty('token');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('value');
    });
  });
});
