
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module.js';

import {
  PROJECT_REPOSITORY,
  type ProjectRepository,
} from './application/ports/project.repository.js';

import {
  WORKSPACE_EXISTENCE_CHECKER,
  type WorkspaceExistenceChecker,
} from './application/ports/workspace-existence-checker.js';

import { CreateProjectUseCase } from './application/use-cases/create-project.use-case.js';

import { PrismaProjectRepository } from './infrastructure/persistence/prisma-project.repository.js';

import { PrismaWorkspaceExistenceChecker } from './infrastructure/persistence/prisma-workspace-existence-checker.js';

import { ProjectResolver } from './presentation/graphql/project.resolver.js';

@Module({
  imports: [PrismaModule],
  providers: [
    ProjectResolver,
    {
      provide: PROJECT_REPOSITORY,
      useClass: PrismaProjectRepository,
    },
    {
      provide: WORKSPACE_EXISTENCE_CHECKER,
      useClass: PrismaWorkspaceExistenceChecker,
    },
    {
      provide: CreateProjectUseCase,
      inject: [
        PROJECT_REPOSITORY,
        WORKSPACE_EXISTENCE_CHECKER,
      ],
      useFactory: (
        projectRepository: ProjectRepository,
        workspaceExistenceChecker: WorkspaceExistenceChecker,
      ) =>
        new CreateProjectUseCase(
          projectRepository,
          workspaceExistenceChecker,
        ),
    },
  ],
  exports: [CreateProjectUseCase],
})
export class ProjectModule {}
