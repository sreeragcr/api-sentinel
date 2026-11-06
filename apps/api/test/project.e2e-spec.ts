
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

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/shared/infrastructure/database/prisma.service.js';

describe('Project GraphQL (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const workspaceIds: string[] = [];

  let firstWorkspaceId: string;
  let secondWorkspaceId: string;

  const CREATE_PROJECT_MUTATION = `
    mutation CreateProject($input: CreateProjectInput!) {
      createProject(input: $input) {
        id
        workspaceId
        name
        slug
        description
        createdAt
        updatedAt
      }
    }
  `;

  const createProjectRequest = (
    workspaceId: string,
    name: string,
  ) =>
    request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: CREATE_PROJECT_MUTATION,
        variables: {
          input: {
            workspaceId,
            name,
          },
        },
      });

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);

    // Create isolated test workspaces.
    const suffix = randomUUID();

    const firstWorkspace = await prisma.workspace.create({
      data: {
        name: `Project E2E A ${suffix}`,
        slug: `project-e2e-a-${suffix}`,
      },
    });

    const secondWorkspace = await prisma.workspace.create({
      data: {
        name: `Project E2E B ${suffix}`,
        slug: `project-e2e-b-${suffix}`,
      },
    });

    firstWorkspaceId = firstWorkspace.id;
    secondWorkspaceId = secondWorkspace.id;

    workspaceIds.push(
      firstWorkspaceId,
      secondWorkspaceId,
    );
  });

  afterAll(async () => {
    // Delete test projects before deleting their workspaces.
    if (workspaceIds.length > 0) {
      await prisma.project.deleteMany({
        where: {
          workspaceId: {
            in: workspaceIds,
          },
        },
      });

      await prisma.workspace.deleteMany({
        where: {
          id: {
            in: workspaceIds,
          },
        },
      });
    }

    await app.close();
  });

  describe('createProject mutation', () => {
    it('should create and persist a project successfully', async () => {
      const response = await createProjectRequest(
        firstWorkspaceId,
        'Backend API',
      ).expect(200);

      expect(response.body.errors).toBeUndefined();

      const project = response.body.data.createProject;

      expect(project.name).toBe('Backend API');
      expect(project.slug).toBe('backend-api');
      expect(project.workspaceId).toBe(firstWorkspaceId);

      // Verify actual PostgreSQL persistence.
      const persistedProject = await prisma.project.findUnique({
        where: {
          id: project.id,
        },
      });

      expect(persistedProject).not.toBeNull();
      expect(persistedProject?.name).toBe('Backend API');
    });

    it('should reject duplicate project creation in the same workspace', async () => {
      const firstResponse = await createProjectRequest(
        firstWorkspaceId,
        'Duplicate Project',
      ).expect(200);

      expect(firstResponse.body.errors).toBeUndefined();

      const duplicateResponse = await createProjectRequest(
        firstWorkspaceId,
        'Duplicate Project',
      ).expect(200);

      expect(duplicateResponse.body.errors).toBeDefined();

      expect(
        duplicateResponse.body.errors[0].extensions.code,
      ).toBe('CONFLICT');
    });

    it('should reject project creation for a non-existent workspace', async () => {
      const response = await createProjectRequest(
        randomUUID(),
        'Invalid Workspace Project',
      ).expect(200);

      expect(response.body.errors).toBeDefined();

      expect(
        response.body.errors[0].extensions.code,
      ).toBe('NOT_FOUND');
    });

    it('should allow the same project slug in different workspaces', async () => {
      const firstResponse = await createProjectRequest(
        firstWorkspaceId,
        'Shared Backend API',
      ).expect(200);

      const secondResponse = await createProjectRequest(
        secondWorkspaceId,
        'Shared Backend API',
      ).expect(200);

      expect(firstResponse.body.errors).toBeUndefined();
      expect(secondResponse.body.errors).toBeUndefined();

      const firstProject =
        firstResponse.body.data.createProject;

      const secondProject =
        secondResponse.body.data.createProject;

      expect(firstProject.slug).toBe(secondProject.slug);

      expect(firstProject.workspaceId).not.toBe(
        secondProject.workspaceId,
      );
    });
  });
});
