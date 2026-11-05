// Workspace NestJS module.

import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module.js';

import {
  WORKSPACE_REPOSITORY,
  WorkspaceRepository,
} from './application/ports/workspace.repository.js';

import { CreateWorkspaceUseCase } from './application/use-cases/create-workspace.use-case.js';

import { PrismaWorkspaceRepository } from './infrastructure/persistence/prisma-workspace.repository.js';

import { WorkspaceResolver } from './presentation/graphql/workspace.resolver.js';

@Module({
  imports: [PrismaModule],
  providers: [
    WorkspaceResolver,
    {
      provide: WORKSPACE_REPOSITORY,
      useClass: PrismaWorkspaceRepository,
    },
    {
      provide: CreateWorkspaceUseCase,
      inject: [WORKSPACE_REPOSITORY],
      useFactory: (repository: WorkspaceRepository) =>
        new CreateWorkspaceUseCase(repository),
    },
  ],
})
export class WorkspaceModule {}
