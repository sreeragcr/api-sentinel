
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
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case.js';
import { DeleteProjectUseCase } from './application/use-cases/delete-project.use-case.js';
import { RestoreProjectUseCase } from './application/use-cases/restore-project.use-case.js';
import { GetProjectByIdUseCase } from './application/use-cases/get-project-by-id.use-case.js';
import { GetProjectsByWorkspaceUseCase } from './application/use-cases/get-projects-by-workspace.use-case.js';
import { GetDeletedProjectsByWorkspaceUseCase } from './application/use-cases/get-deleted-projects-by-workspace.use-case.js';
import { PermanentlyDeleteProjectUseCase } from './application/use-cases/permanently-delete-project.use-case.js';

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
        {
            provide: UpdateProjectUseCase,
            inject: [PROJECT_REPOSITORY],
            useFactory: (repository: ProjectRepository) =>
                new UpdateProjectUseCase(repository),
        },
        {
            provide: DeleteProjectUseCase,
            inject: [PROJECT_REPOSITORY],
            useFactory: (repository: ProjectRepository) =>
                new DeleteProjectUseCase(repository),
        },
        {
            provide: PermanentlyDeleteProjectUseCase,
            inject: [PROJECT_REPOSITORY],
            useFactory: (repository: ProjectRepository) =>
                new PermanentlyDeleteProjectUseCase(repository),
        },
        {
            provide: RestoreProjectUseCase,
            inject: [PROJECT_REPOSITORY],
            useFactory: (repository: ProjectRepository) =>
                new RestoreProjectUseCase(repository),
        },
        {
            provide: GetProjectByIdUseCase,
            inject: [PROJECT_REPOSITORY],
            useFactory: (repository: ProjectRepository) =>
                new GetProjectByIdUseCase(repository),
        },
        {
            provide: GetProjectsByWorkspaceUseCase,
            inject: [
                PROJECT_REPOSITORY,
                WORKSPACE_EXISTENCE_CHECKER,
            ],
            useFactory: (
                repository: ProjectRepository,
                workspaceChecker: WorkspaceExistenceChecker,
            ) =>
                new GetProjectsByWorkspaceUseCase(
                    repository,
                    workspaceChecker,
                ),
        },
        {
            provide: GetDeletedProjectsByWorkspaceUseCase,
            inject: [
                PROJECT_REPOSITORY,
                WORKSPACE_EXISTENCE_CHECKER,
            ],
            useFactory: (
                repository: ProjectRepository,
                workspaceChecker: WorkspaceExistenceChecker,
            ) =>
                new GetDeletedProjectsByWorkspaceUseCase(
                    repository,
                    workspaceChecker,
                ),
        },
    ],
    exports: [CreateProjectUseCase],
})
export class ProjectModule { }
