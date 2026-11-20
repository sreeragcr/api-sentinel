
import { Credential } from '../../domain/entities/credential.entity.js';
import type { CredentialValue } from '../../domain/types/credential-value.type.js';

import { CredentialNotFoundError } from '../errors/credential-not-found.error.js';
import { DuplicateCredentialError } from '../errors/duplicate-credential.error.js';
import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';
import { CredentialTypeMismatchError } from '../errors/credential-type-mismatch.error.js';

import type { CredentialRepository } from '../ports/credential.repository.js';
import type { CredentialEncryptionPort } from '../ports/credential-encryption.port.js';
import type { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

export interface UpdateCredentialInput {
  credentialId: string;
  workspaceId: string;
  name: string;
  value: CredentialValue;
}

export class UpdateCredentialUseCase {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly encryption: CredentialEncryptionPort,
    private readonly workspaceExistenceChecker: WorkspaceExistenceChecker,
  ) { }

  async execute(input: UpdateCredentialInput): Promise<Credential> {
    const workspaceExists =
      await this.workspaceExistenceChecker.existsById(input.workspaceId);

    if (!workspaceExists) {
      throw new WorkspaceNotFoundError(input.workspaceId);
    }

    const credential = await this.credentialRepository.findById(
      input.credentialId,
      input.workspaceId,
    );

    if (!credential) {
      throw new CredentialNotFoundError(input.credentialId);
    }

    if (credential.type !== input.value.type) {
      throw new CredentialTypeMismatchError();
    }

    const name = input.name.trim();

    const existingCredential =
      await this.credentialRepository.findByWorkspaceIdAndName(
        input.workspaceId,
        name,
      );

    if (
      existingCredential &&
      existingCredential.id !== credential.id
    ) {
      throw new DuplicateCredentialError(input.workspaceId, name);
    }

    const encryptedValue = this.encryption.encrypt(
      JSON.stringify(input.value),
    );

    const updatedCredential = credential.update({
      name,
      encryptedValue,
    });

    return this.credentialRepository.update(updatedCredential);
  }
}

