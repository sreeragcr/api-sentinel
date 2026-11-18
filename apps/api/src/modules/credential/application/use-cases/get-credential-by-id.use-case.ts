
import { CredentialNotFoundError } from '../errors/credential-not-found.error.js';
import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';

import type { CredentialRepository } from '../ports/credential.repository.js';
import type { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

import { Credential } from '../../domain/entities/credential.entity.js';

export interface GetCredentialByIdInput {
  credentialId: string;
  workspaceId: string;
}

export class GetCredentialByIdUseCase {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly workspaceExistenceChecker: WorkspaceExistenceChecker,
  ) {}

  async execute(input: GetCredentialByIdInput): Promise<Credential> {
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

    return credential;
  }
}

