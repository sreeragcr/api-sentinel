
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Credential } from '../../domain/entities/credential.entity.js';
import { CredentialType } from '../../domain/enums/credential-type.enum.js';

import { DuplicateCredentialError } from '../errors/duplicate-credential.error.js';
import { CredentialNotFoundError } from '../errors/credential-not-found.error.js';
import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';

import type { CredentialRepository } from '../ports/credential.repository.js';
import type { CredentialEncryptionPort } from '../ports/credential-encryption.port.js';
import type { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

import { UpdateCredentialUseCase } from './update-credential.use-case.js';
import type { UpdateCredentialInput } from './update-credential.use-case.js';

describe('UpdateCredentialUseCase', () => {
    const save = vi.fn<CredentialRepository['save']>();
    const update = vi.fn<CredentialRepository['update']>();
    const deleteCredential = vi.fn<CredentialRepository['delete']>();
    const findById = vi.fn<CredentialRepository['findById']>();
    const findByWorkspaceId =
        vi.fn<CredentialRepository['findByWorkspaceId']>();
    const findByWorkspaceIdAndName =
        vi.fn<CredentialRepository['findByWorkspaceIdAndName']>();

    const encrypt = vi.fn<CredentialEncryptionPort['encrypt']>();
    const decrypt = vi.fn<CredentialEncryptionPort['decrypt']>();

    const existsById =
        vi.fn<WorkspaceExistenceChecker['existsById']>();

    const credentialRepository = {
        save,
        update,
        delete: deleteCredential,
        findById,
        findByWorkspaceId,
        findByWorkspaceIdAndName,
    } as unknown as CredentialRepository;

    const encryption = {
        encrypt,
        decrypt,
    } as CredentialEncryptionPort;

    const workspaceExistenceChecker = {
        existsById,
    } as WorkspaceExistenceChecker;

    let useCase: UpdateCredentialUseCase;

    const workspaceId = '123e4567-e89b-42d3-a456-426614174000';
    const credentialId = '123e4567-e89b-42d3-a456-426614174001';

    const existingCredential = () =>
        Credential.create({
            id: credentialId,
            workspaceId,
            name: 'Production API Credential',
            type: CredentialType.BEARER,
            encryptedValue: 'old-encrypted-value',
        });

    const input: UpdateCredentialInput = {
        credentialId,
        workspaceId,
        name: 'Updated API Credential',
        value: {
            type: CredentialType.BEARER,
            token: 'new-secret-token',
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        useCase = new UpdateCredentialUseCase(
            credentialRepository,
            encryption,
            workspaceExistenceChecker,
        );

        existsById.mockResolvedValue(true);
        findById.mockResolvedValue(existingCredential());
        findByWorkspaceIdAndName.mockResolvedValue(null);
        encrypt.mockReturnValue('new-encrypted-value');
        update.mockImplementation(async (credential) => credential);
    });

    // --------------------------------------------------
    // SUCCESSFUL UPDATE
    // --------------------------------------------------

    describe('execute()', () => {
        it('should update a credential successfully', async () => {
            const result = await useCase.execute(input);

            expect(existsById).toHaveBeenCalledWith(workspaceId);

            expect(findById).toHaveBeenCalledWith(
                credentialId,
                workspaceId,
            );

            expect(findByWorkspaceIdAndName).toHaveBeenCalledWith(
                workspaceId,
                input.name,
            );

            expect(encrypt).toHaveBeenCalledWith(
                JSON.stringify(input.value),
            );

            expect(update).toHaveBeenCalledOnce();

            expect(result.id).toBe(credentialId);
            expect(result.workspaceId).toBe(workspaceId);
            expect(result.name).toBe(input.name);
            expect(result.type).toBe(CredentialType.BEARER);
            expect(result.encryptedValue).toBe('new-encrypted-value');
        });

        it('should allow keeping the existing credential name', async () => {
            const credential = existingCredential();

            findById.mockResolvedValue(credential);

            findByWorkspaceIdAndName.mockResolvedValue(credential);

            const result = await useCase.execute({
                ...input,
                name: credential.name,
            });

            expect(result.name).toBe(credential.name);
            expect(update).toHaveBeenCalledOnce();
        });

        it('should preserve the existing credential type', async () => {
            const result = await useCase.execute(input);

            expect(result.type).toBe(CredentialType.BEARER);
        });
    });

    // --------------------------------------------------
    // WORKSPACE VALIDATION
    // --------------------------------------------------

    describe('workspace validation', () => {
        it('should throw WorkspaceNotFoundError when workspace does not exist', async () => {
            existsById.mockResolvedValue(false);

            await expect(useCase.execute(input)).rejects.toBeInstanceOf(
                WorkspaceNotFoundError,
            );

            expect(findById).not.toHaveBeenCalled();
            expect(update).not.toHaveBeenCalled();
        });
    });

    // --------------------------------------------------
    // CREDENTIAL VALIDATION
    // --------------------------------------------------

    describe('credential validation', () => {
        it('should throw CredentialNotFoundError when credential does not exist', async () => {
            findById.mockResolvedValue(null);

            await expect(useCase.execute(input)).rejects.toBeInstanceOf(
                CredentialNotFoundError,
            );

            expect(encrypt).not.toHaveBeenCalled();
            expect(update).not.toHaveBeenCalled();
        });

        it('should throw an error when credential type is changed', async () => {
            const apiKeyInput = {
                ...input,
                value: {
                    type: CredentialType.API_KEY as const,
                    value: 'new-api-key',
                },
            };

            await expect(
                useCase.execute(apiKeyInput),
            ).rejects.toThrow(
                'Credential type cannot be changed during an update',
            );

            expect(encrypt).not.toHaveBeenCalled();
            expect(update).not.toHaveBeenCalled();
        });

        it('should throw DuplicateCredentialError when another credential uses the new name', async () => {
            const anotherCredential = Credential.create({
                id: '123e4567-e89b-42d3-a456-426614174002',
                workspaceId,
                name: input.name,
                type: CredentialType.BEARER,
                encryptedValue: 'another-encrypted-value',
            });

            findByWorkspaceIdAndName.mockResolvedValue(anotherCredential);

            await expect(useCase.execute(input)).rejects.toBeInstanceOf(
                DuplicateCredentialError,
            );

            expect(encrypt).not.toHaveBeenCalled();
            expect(update).not.toHaveBeenCalled();
        });
    });

    // --------------------------------------------------
    // ENCRYPTION AND REPOSITORY ERRORS
    // --------------------------------------------------

    describe('error handling', () => {
        it('should propagate encryption errors', async () => {
            const encryptionError = new Error('Encryption failed');

            encrypt.mockImplementation(() => {
                throw encryptionError;
            });

            await expect(useCase.execute(input)).rejects.toBe(
                encryptionError,
            );

            expect(update).not.toHaveBeenCalled();
        });

        it('should propagate repository update errors', async () => {
            const repositoryError = new Error('Database unavailable');

            update.mockRejectedValue(repositoryError);

            await expect(useCase.execute(input)).rejects.toBe(
                repositoryError,
            );
        });
    });
});
