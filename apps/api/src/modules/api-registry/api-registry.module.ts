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
  REST_REQUEST_CONFIGURATION_REPOSITORY,
  type RestRequestConfigurationRepository,
} from './application/ports/rest-request-configuration.repository.js';
import {
  API_ENVIRONMENT_REPOSITORY,
  type ApiEnvironmentRepository,
} from './application/ports/api-environment.repository.js';

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
import { DeleteRestEndpointUseCase } from './application/use-cases/delete-rest-endpoint.use-case.js';
import { CreateApiEnvironmentUseCase } from './application/use-cases/create-api-environment.use-case.js';
import { GetApiEnvironmentByIdUseCase } from './application/use-cases/get-api-environment-by-id.use-case.js';
import { GetApiEnvironmentsByApiDefinitionUseCase } from './application/use-cases/get-api-environments-by-api-definition.use-case.js';
import { UpdateApiEnvironmentUseCase } from './application/use-cases/update-api-environment.use-case.js';
import { DeleteApiEnvironmentUseCase } from './application/use-cases/delete-api-environment.use-case.js';

import { CreateRestRequestConfigurationUseCase } from './application/use-cases/create-rest-request-configuration.use-case.js';
import { GetRestRequestConfigurationByEndpointIdUseCase } from './application/use-cases/get-rest-request-configuration-by-endpoint-id.use-case.js';

import { PrismaApiDefinitionRepository } from './infrastructure/persistence/prisma-api-definition.repository.js';
import { PrismaRestEndpointRepository } from './infrastructure/persistence/prisma-rest-endpoint.repository.js';
import { PrismaRestRequestConfigurationRepository } from './infrastructure/persistence/prisma-rest-request-configuration.repository.js';
import { PrismaProjectExistenceChecker } from './infrastructure/persistence/prisma-project-existence-checker.js';
import { PrismaApiEnvironmentRepository } from './infrastructure/persistence/prisma-api-environment.repository.js';

import { ApiDefinitionResolver } from './presentation/graphql/api-definition.resolver.js';
import { RestEndpointResolver } from './presentation/graphql/rest-endpoint.resolver.js';
import { RestRequestConfigurationResolver } from './presentation/graphql/rest-request-configuration.resolver.js';
import { ApiEnvironmentResolver } from './presentation/graphql/api-environment.resolver.js';

@Module({
  imports: [PrismaModule],

  providers: [
    ApiDefinitionResolver,
    RestEndpointResolver,
    RestRequestConfigurationResolver,
    ApiEnvironmentResolver,
    {
      provide: API_DEFINITION_REPOSITORY,
      useClass: PrismaApiDefinitionRepository,
    },
    {
      provide: REST_ENDPOINT_REPOSITORY,
      useClass: PrismaRestEndpointRepository,
    },
    {
      provide: REST_REQUEST_CONFIGURATION_REPOSITORY,
      useClass: PrismaRestRequestConfigurationRepository,
    },
    {
      provide: API_ENVIRONMENT_REPOSITORY,
      useClass: PrismaApiEnvironmentRepository,
    },
    {
      provide: PROJECT_EXISTENCE_CHECKER,
      useClass: PrismaProjectExistenceChecker,
    },

    {
      provide: CreateApiDefinitionUseCase,
      inject: [API_DEFINITION_REPOSITORY, PROJECT_EXISTENCE_CHECKER],
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
      useFactory: (apiDefinitionRepository: ApiDefinitionRepository) =>
        new GetApiDefinitionByIdUseCase(apiDefinitionRepository),
    },
    {
      provide: GetApiDefinitionsByProjectUseCase,
      inject: [API_DEFINITION_REPOSITORY, PROJECT_EXISTENCE_CHECKER],
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
      inject: [REST_ENDPOINT_REPOSITORY, API_DEFINITION_REPOSITORY],
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
      useFactory: (restEndpointRepository: RestEndpointRepository) =>
        new GetRestEndpointByIdUseCase(restEndpointRepository),
    },
    {
      provide: GetRestEndpointsByApiDefinitionUseCase,
      inject: [REST_ENDPOINT_REPOSITORY, API_DEFINITION_REPOSITORY],
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
      useFactory: (restEndpointRepository: RestEndpointRepository) =>
        new UpdateRestEndpointUseCase(restEndpointRepository),
    },
    {
      provide: DeleteRestEndpointUseCase,
      inject: [REST_ENDPOINT_REPOSITORY],
      useFactory: (restEndpointRepository: RestEndpointRepository) =>
        new DeleteRestEndpointUseCase(restEndpointRepository),
    },
    {
      provide: CreateApiEnvironmentUseCase,
      inject: [API_ENVIRONMENT_REPOSITORY, API_DEFINITION_REPOSITORY],
      useFactory: (
        environmentRepository: ApiEnvironmentRepository,
        apiDefinitionRepository: ApiDefinitionRepository,
      ) =>
        new CreateApiEnvironmentUseCase(
          environmentRepository,
          apiDefinitionRepository,
        ),
    },
    {
      provide: GetApiEnvironmentByIdUseCase,
      inject: [API_ENVIRONMENT_REPOSITORY],
      useFactory: (environmentRepository: ApiEnvironmentRepository) =>
        new GetApiEnvironmentByIdUseCase(environmentRepository),
    },
    {
      provide: GetApiEnvironmentsByApiDefinitionUseCase,
      inject: [API_ENVIRONMENT_REPOSITORY, API_DEFINITION_REPOSITORY],
      useFactory: (
        environmentRepository: ApiEnvironmentRepository,
        apiDefinitionRepository: ApiDefinitionRepository,
      ) =>
        new GetApiEnvironmentsByApiDefinitionUseCase(
          environmentRepository,
          apiDefinitionRepository,
        ),
    },
    {
      provide: UpdateApiEnvironmentUseCase,
      inject: [API_ENVIRONMENT_REPOSITORY],
      useFactory: (environmentRepository: ApiEnvironmentRepository) =>
        new UpdateApiEnvironmentUseCase(environmentRepository),
    },
    {
      provide: DeleteApiEnvironmentUseCase,
      inject: [API_ENVIRONMENT_REPOSITORY],
      useFactory: (environmentRepository: ApiEnvironmentRepository) =>
        new DeleteApiEnvironmentUseCase(environmentRepository),
    },

    // REST request configuration use cases
    {
      provide: CreateRestRequestConfigurationUseCase,
      inject: [REST_REQUEST_CONFIGURATION_REPOSITORY, REST_ENDPOINT_REPOSITORY],
      useFactory: (
        restRequestConfigurationRepository: RestRequestConfigurationRepository,
        restEndpointRepository: RestEndpointRepository,
      ) =>
        new CreateRestRequestConfigurationUseCase(
          restRequestConfigurationRepository,
          restEndpointRepository,
        ),
    },
    {
      provide: GetRestRequestConfigurationByEndpointIdUseCase,
      inject: [REST_REQUEST_CONFIGURATION_REPOSITORY],
      useFactory: (
        restRequestConfigurationRepository: RestRequestConfigurationRepository,
      ) =>
        new GetRestRequestConfigurationByEndpointIdUseCase(
          restRequestConfigurationRepository,
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
    DeleteRestEndpointUseCase,
    CreateApiEnvironmentUseCase,
    GetApiEnvironmentByIdUseCase,
    GetApiEnvironmentsByApiDefinitionUseCase,
    UpdateApiEnvironmentUseCase,
    DeleteApiEnvironmentUseCase,
    CreateRestRequestConfigurationUseCase,
    GetRestRequestConfigurationByEndpointIdUseCase,
  ],
})
export class ApiRegistryModule {}
