
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module.js';

import {
  API_DEFINITION_REPOSITORY,
  type ApiDefinitionRepository,
} from './application/ports/api-definition.repository.js';

import {
  PROJECT_EXISTENCE_CHECKER,
  type ProjectExistenceChecker,
} from './application/ports/project-existence-checker.js';

import { CreateApiDefinitionUseCase } from './application/use-cases/create-api-definition.use-case.js';

import { GetApiDefinitionByIdUseCase } from './application/use-cases/get-api-definition-by-id.use-case.js';

import { GetApiDefinitionsByProjectUseCase } from './application/use-cases/get-api-definitions-by-project.use-case.js';

import { PrismaApiDefinitionRepository } from './infrastructure/persistence/prisma-api-definition.repository.js';

import { PrismaProjectExistenceChecker } from './infrastructure/persistence/prisma-project-existence-checker.js';

import { ApiDefinitionResolver } from './presentation/graphql/api-definition.resolver.js';

@Module({
  imports: [PrismaModule],

  providers: [
    ApiDefinitionResolver,

    {
      provide: API_DEFINITION_REPOSITORY,
      useClass: PrismaApiDefinitionRepository,
    },

    {
      provide: PROJECT_EXISTENCE_CHECKER,
      useClass: PrismaProjectExistenceChecker,
    },

    {
      provide: CreateApiDefinitionUseCase,
      inject: [
        API_DEFINITION_REPOSITORY,
        PROJECT_EXISTENCE_CHECKER,
      ],
      useFactory: (
        apiDefinitionRepository: ApiDefinitionRepository,
        projectExistenceChecker: ProjectExistenceChecker,
      ) =>
        new CreateApiDefinitionUseCase(
          apiDefinitionRepository,
          projectExistenceChecker,
        ),
    },

    {
      provide: GetApiDefinitionByIdUseCase,
      inject: [API_DEFINITION_REPOSITORY],
      useFactory: (
        apiDefinitionRepository: ApiDefinitionRepository,
      ) =>
        new GetApiDefinitionByIdUseCase(
          apiDefinitionRepository,
        ),
    },

    {
      provide: GetApiDefinitionsByProjectUseCase,
      inject: [
        API_DEFINITION_REPOSITORY,
        PROJECT_EXISTENCE_CHECKER,
      ],
      useFactory: (
        apiDefinitionRepository: ApiDefinitionRepository,
        projectExistenceChecker: ProjectExistenceChecker,
      ) =>
        new GetApiDefinitionsByProjectUseCase(
          apiDefinitionRepository,
          projectExistenceChecker,
        ),
    },
  ],

  exports: [
    CreateApiDefinitionUseCase,
    GetApiDefinitionByIdUseCase,
    GetApiDefinitionsByProjectUseCase,
  ],
})
export class ApiRegistryModule {}
