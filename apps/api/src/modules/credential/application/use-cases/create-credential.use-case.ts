
import { randomUUID } from 'node:crypto';

import { Credential } from '../../domain/entities/credential.entity.js';
import type { CredentialValue } from '../../domain/types/credential-value.type.js';

import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';
import { DuplicateCredentialError } from '../errors/duplicate-credential.error.js';

import type { CredentialRepository } from '../ports/credential.repository.js';
import type { CredentialEncryptionPort } from '../ports/credential-encryption.port.js';
import type { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

export interface CreateCredentialInput {
    workspaceId: string;
    name: string;
    value: CredentialValue;
}

export class CreateCredentialUseCase {
    constructor(
        private readonly credentialRepository: CredentialRepository,
        private readonly encryption: CredentialEncryptionPort,
        private readonly workspaceExistenceChecker: WorkspaceExistenceChecker,
    ) { }

    async execute(input: CreateCredentialInput): Promise<Credential> {
        const workspaceExists =
            await this.workspaceExistenceChecker.existsById(input.workspaceId);

        if (!workspaceExists) {
            throw new WorkspaceNotFoundError(input.workspaceId);
        }

        const name = input.name.trim();

        const existing =
            await this.credentialRepository.findByWorkspaceIdAndName(
                input.workspaceId,
                name,
            );

        if (existing) {
            throw new DuplicateCredentialError(input.workspaceId, name);
        }

        const encryptedValue = this.encryption.encrypt(
            JSON.stringify(input.value),
        );

        return this.credentialRepository.save(
            Credential.create({
                id: randomUUID(),
                workspaceId: input.workspaceId,
                name,
                type: input.value.type,
                encryptedValue,
            }),
        );
    }
}

