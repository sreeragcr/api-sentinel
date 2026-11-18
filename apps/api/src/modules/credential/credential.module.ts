
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module.js';

import {
  CREDENTIAL_ENCRYPTION,
  type CredentialEncryptionPort,
} from './application/ports/credential-encryption.port.js';

import {
  CREDENTIAL_REPOSITORY,
  type CredentialRepository,
} from './application/ports/credential.repository.js';

import {
  WORKSPACE_EXISTENCE_CHECKER,
  type WorkspaceExistenceChecker,
} from './application/ports/workspace-existence-checker.js';

import { CreateCredentialUseCase } from './application/use-cases/create-credential.use-case.js';

import { GetCredentialByIdUseCase } from './application/use-cases/get-credential-by-id.use-case.js';

import { GetCredentialsByWorkspaceUseCase } from './application/use-cases/get-credentials-by-workspace.use-case.js';

import { UpdateCredentialUseCase } from './application/use-cases/update-credential.use-case.js';

import { CredentialEncryptionService } from './infrastructure/encryption/credential-encryption.service.js';

import { PrismaCredentialRepository } from './infrastructure/persistence/prisma-credential.repository.js';

import { PrismaWorkspaceExistenceChecker } from './infrastructure/persistence/prisma-workspace-existence-checker.js';

import { CredentialResolver } from './presentation/graphql/credential.resolver.js';

@Module({
  imports: [PrismaModule],

  providers: [
    CredentialResolver,

    {
      provide: CREDENTIAL_ENCRYPTION,
      useClass: CredentialEncryptionService,
    },

    {
      provide: CREDENTIAL_REPOSITORY,
      useClass: PrismaCredentialRepository,
    },

    {
      provide: WORKSPACE_EXISTENCE_CHECKER,
      useClass: PrismaWorkspaceExistenceChecker,
    },

    {
      provide: CreateCredentialUseCase,
      inject: [
        CREDENTIAL_REPOSITORY,
        CREDENTIAL_ENCRYPTION,
        WORKSPACE_EXISTENCE_CHECKER,
      ],
      useFactory: (
        credentialRepository: CredentialRepository,
        encryption: CredentialEncryptionPort,
        workspaceExistenceChecker: WorkspaceExistenceChecker,
      ) =>
        new CreateCredentialUseCase(
          credentialRepository,
          encryption,
          workspaceExistenceChecker,
        ),
    },

    {
      provide: GetCredentialByIdUseCase,
      inject: [
        CREDENTIAL_REPOSITORY,
        WORKSPACE_EXISTENCE_CHECKER,
      ],
      useFactory: (
        credentialRepository: CredentialRepository,
        workspaceExistenceChecker: WorkspaceExistenceChecker,
      ) =>
        new GetCredentialByIdUseCase(
          credentialRepository,
          workspaceExistenceChecker,
        ),
    },

    {
      provide: GetCredentialsByWorkspaceUseCase,
      inject: [
        CREDENTIAL_REPOSITORY,
        WORKSPACE_EXISTENCE_CHECKER,
      ],
      useFactory: (
        credentialRepository: CredentialRepository,
        workspaceExistenceChecker: WorkspaceExistenceChecker,
      ) =>
        new GetCredentialsByWorkspaceUseCase(
          credentialRepository,
          workspaceExistenceChecker,
        ),
    },

    // UPDATE CREDENTIAL USE CASE
    {
      provide: UpdateCredentialUseCase,
      inject: [
        CREDENTIAL_REPOSITORY,
        CREDENTIAL_ENCRYPTION,
        WORKSPACE_EXISTENCE_CHECKER,
      ],
      useFactory: (
        credentialRepository: CredentialRepository,
        encryption: CredentialEncryptionPort,
        workspaceExistenceChecker: WorkspaceExistenceChecker,
      ) =>
        new UpdateCredentialUseCase(
          credentialRepository,
          encryption,
          workspaceExistenceChecker,
        ),
    },
  ],

  exports: [
    CreateCredentialUseCase,
    GetCredentialByIdUseCase,
    GetCredentialsByWorkspaceUseCase,
    UpdateCredentialUseCase,
    CREDENTIAL_ENCRYPTION,
  ],
})
export class CredentialModule {}
