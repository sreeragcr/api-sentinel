import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HealthModule } from './modules/health/health.module.js';
import { PrismaModule } from './shared/infrastructure/database/prisma.module.js';
import { WorkspaceModule } from './modules/workspace/workspace.module.js';
import { ProjectModule } from './modules/project/project.module.js';
import { join } from 'node:path';
import {
  ApolloDriver,
  type ApolloDriverConfig,
} from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    HealthModule,
    PrismaModule,
    WorkspaceModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
