
import { Credential } from '../../domain/entities/credential.entity.js';

export const CREDENTIAL_REPOSITORY = Symbol('CREDENTIAL_REPOSITORY');

export interface CredentialRepository {
  save(credential: Credential): Promise<Credential>;

  update(credential: Credential): Promise<Credential>;

  delete(id: string, workspaceId: string): Promise<void>;

  findById(id: string, workspaceId: string): Promise<Credential | null>;

  findByWorkspaceId(workspaceId: string): Promise<Credential[]>;

  findByWorkspaceIdAndName(
    workspaceId: string,
    name: string,
  ): Promise<Credential | null>;
}
