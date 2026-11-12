
import { Module } from '@nestjs/common';
import { join } from 'node:path';

import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { HealthModule } from './modules/health/health.module.js';
import { WorkspaceModule } from './modules/workspace/workspace.module.js';
import { ProjectModule } from './modules/project/project.module.js';
import { ApiRegistryModule } from './modules/api-registry/api-registry.module.js';

import { PrismaModule } from './shared/infrastructure/database/prisma.module.js';

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    WorkspaceModule,
    ProjectModule,
    ApiRegistryModule,

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
