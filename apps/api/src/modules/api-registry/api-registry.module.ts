
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../shared/infrastructure/database/prisma.module.js';

import {
  API_DEFINITION_REPOSITORY,
  type ApiDefinitionRepository,
} from './application/ports/api-definition.repository.js';

import {
  REST_ENDPOINT_REPOSITORY,
  type RestEndpointRepository,
} from './application/ports/rest-endpoint.repository.js';

import {
  PROJECT_EXISTENCE_CHECKER,
  type ProjectExistenceChecker,
} from './application/ports/project-existence-checker.js';

import { CreateApiDefinitionUseCase } from './application/use-cases/create-api-definition.use-case.js';
import { GetApiDefinitionByIdUseCase } from './application/use-cases/get-api-definition-by-id.use-case.js';
import { GetApiDefinitionsByProjectUseCase } from './application/use-cases/get-api-definitions-by-project.use-case.js';
import { CreateRestEndpointUseCase } from './application/use-cases/create-rest-endpoint.use-case.js';
import { GetRestEndpointByIdUseCase } from './application/use-cases/get-rest-endpoint-by-id.use-case.js';
import { GetRestEndpointsByApiDefinitionUseCase } from './application/use-cases/get-rest-endpoints-by-api-definition.use-case.js';
import { UpdateRestEndpointUseCase } from './application/use-cases/update-rest-endpoint.use-case.js';

import { PrismaApiDefinitionRepository } from './infrastructure/persistence/prisma-api-definition.repository.js';
import { PrismaRestEndpointRepository } from './infrastructure/persistence/prisma-rest-endpoint.repository.js';
import { PrismaProjectExistenceChecker } from './infrastructure/persistence/prisma-project-existence-checker.js';

import { ApiDefinitionResolver } from './presentation/graphql/api-definition.resolver.js';
import { RestEndpointResolver } from './presentation/graphql/rest-endpoint.resolver.js';

@Module({
  imports: [PrismaModule],

  providers: [
    ApiDefinitionResolver,
    RestEndpointResolver,
    {
      provide: API_DEFINITION_REPOSITORY,
      useClass: PrismaApiDefinitionRepository,
    },
    {
      provide: REST_ENDPOINT_REPOSITORY,
      useClass: PrismaRestEndpointRepository,
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
    {
      provide: CreateRestEndpointUseCase,
      inject: [
        REST_ENDPOINT_REPOSITORY,
        API_DEFINITION_REPOSITORY,
      ],
      useFactory: (
        restEndpointRepository: RestEndpointRepository,
        apiDefinitionRepository: ApiDefinitionRepository,
      ) =>
        new CreateRestEndpointUseCase(
          restEndpointRepository,
          apiDefinitionRepository,
        ),
    },
    {
      provide: GetRestEndpointByIdUseCase,
      inject: [REST_ENDPOINT_REPOSITORY],
      useFactory: (
        restEndpointRepository: RestEndpointRepository,
      ) =>
        new GetRestEndpointByIdUseCase(
          restEndpointRepository,
        ),
    },
    {
      provide: GetRestEndpointsByApiDefinitionUseCase,
      inject: [
        REST_ENDPOINT_REPOSITORY,
        API_DEFINITION_REPOSITORY,
      ],
      useFactory: (
        restEndpointRepository: RestEndpointRepository,
        apiDefinitionRepository: ApiDefinitionRepository,
      ) =>
        new GetRestEndpointsByApiDefinitionUseCase(
          restEndpointRepository,
          apiDefinitionRepository,
        ),
    },
    {
      provide: UpdateRestEndpointUseCase,
      inject: [REST_ENDPOINT_REPOSITORY],
      useFactory: (
        restEndpointRepository: RestEndpointRepository,
      ) =>
        new UpdateRestEndpointUseCase(
          restEndpointRepository,
        ),
    },
  ],

  exports: [
    CreateApiDefinitionUseCase,
    GetApiDefinitionByIdUseCase,
    GetApiDefinitionsByProjectUseCase,
    CreateRestEndpointUseCase,
    GetRestEndpointByIdUseCase,
    GetRestEndpointsByApiDefinitionUseCase,
    UpdateRestEndpointUseCase,
  ],
})
export class ApiRegistryModule {}
