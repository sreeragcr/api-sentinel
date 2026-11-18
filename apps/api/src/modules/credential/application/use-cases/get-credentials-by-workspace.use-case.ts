
import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';

import type { CredentialRepository } from '../ports/credential.repository.js';
import type { WorkspaceExistenceChecker } from '../ports/workspace-existence-checker.js';

import { Credential } from '../../domain/entities/credential.entity.js';

export class GetCredentialsByWorkspaceUseCase {
  constructor(
    private readonly credentialRepository: CredentialRepository,
    private readonly workspaceExistenceChecker: WorkspaceExistenceChecker,
  ) {}

  async execute(workspaceId: string): Promise<Credential[]> {
    const workspaceExists =
      await this.workspaceExistenceChecker.existsById(workspaceId);

    if (!workspaceExists) {
      throw new WorkspaceNotFoundError(workspaceId);
    }

    return this.credentialRepository.findByWorkspaceId(workspaceId);
  }
}
