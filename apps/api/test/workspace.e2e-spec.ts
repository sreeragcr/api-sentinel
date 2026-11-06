
import { randomUUID } from 'node:crypto';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import request from 'supertest';
import { App } from 'supertest/types.js';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/shared/infrastructure/database/prisma.service.js';

describe('Workspace GraphQL (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const createdWorkspaceIds: string[] = [];
  const workspaceName = `E2E Workspace ${randomUUID()}`;

  const CREATE_WORKSPACE_MUTATION = `
    mutation CreateWorkspace($input: CreateWorkspaceInput!) {
      createWorkspace(input: $input) {
        id
        name
        slug
        description
        createdAt
        updatedAt
      }
    }
  `;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same global validation configuration as main.ts.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    // Remove only records created by this test suite.
    if (createdWorkspaceIds.length > 0) {
      await prisma.workspace.deleteMany({
        where: {
          id: {
            in: createdWorkspaceIds,
          },
        },
      });
    }

    await app.close();
  });

  describe('createWorkspace mutation', () => {
    it('should create and persist a workspace successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: CREATE_WORKSPACE_MUTATION,
          variables: {
            input: {
              name: workspaceName,
              description: 'Created through GraphQL E2E testing',
            },
          },
        })
        .expect(200);

      expect(response.body.errors).toBeUndefined();

      const workspace = response.body.data.createWorkspace;

      expect(workspace.name).toBe(workspaceName);
      expect(workspace.slug).toBe(
        workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/g, ''),
      );

      expect(workspace.description).toBe(
        'Created through GraphQL E2E testing',
      );

      createdWorkspaceIds.push(workspace.id);

      // Verify actual PostgreSQL persistence.
      const persistedWorkspace = await prisma.workspace.findUnique({
        where: {
          id: workspace.id,
        },
      });

      expect(persistedWorkspace).not.toBeNull();
      expect(persistedWorkspace?.name).toBe(workspaceName);
    });

    it('should reject duplicate workspace creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: CREATE_WORKSPACE_MUTATION,
          variables: {
            input: {
              name: workspaceName,
            },
          },
        })
        .expect(200);

      expect(response.body.errors).toBeDefined();

      expect(response.body.errors[0].extensions.code).toBe(
        'CONFLICT',
      );
    });

    it('should reject invalid workspace input', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: CREATE_WORKSPACE_MUTATION,
          variables: {
            input: {
              name: '',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
    });
  });
});
