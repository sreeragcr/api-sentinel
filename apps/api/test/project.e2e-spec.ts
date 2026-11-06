
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

  // --------------------------------------------------
  // GRAPHQL MUTATION AND QUERY DEFINITIONS
  // --------------------------------------------------

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

  const GET_PROJECT_QUERY = `
    query GetProject($id: ID!) {
      project(id: $id) {
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

  const GET_PROJECTS_BY_WORKSPACE_QUERY = `
    query GetProjectsByWorkspace(
      $input: GetProjectsByWorkspaceInput!
    ) {
      projectsByWorkspace(input: $input) {
        items {
          id
          workspaceId
          name
          slug
          description
        }
        totalCount
      }
    }
  `;

  // --------------------------------------------------
  // GRAPHQL REQUEST HELPERS
  // --------------------------------------------------

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

  const getProjectRequest = (id: string) =>
    request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: GET_PROJECT_QUERY,
        variables: {
          id,
        },
      });

  const getProjectsByWorkspaceRequest = (
    workspaceId: string,
    offset = 0,
    limit = 20,
  ) =>
    request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: GET_PROJECTS_BY_WORKSPACE_QUERY,
        variables: {
          input: {
            workspaceId,
            offset,
            limit,
          },
        },
      });

  // --------------------------------------------------
  // TEST DATA HELPERS
  // --------------------------------------------------

  const createTestWorkspace = async (prefix: string) => {
    const suffix = randomUUID();

    const workspace = await prisma.workspace.create({
      data: {
        name: `${prefix} ${suffix}`,
        slug: `${prefix.toLowerCase().replace(/\s+/g, '-')}-${suffix}`,
      },
    });

    workspaceIds.push(workspace.id);

    return workspace;
  };

  // --------------------------------------------------
  // SETUP
  // --------------------------------------------------

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

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  afterAll(async () => {
    if (workspaceIds.length > 0) {
      // Delete test projects before deleting their workspaces.
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

  // --------------------------------------------------
  // CREATE PROJECT MUTATION
  // --------------------------------------------------

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

  // --------------------------------------------------
  // GET PROJECT BY ID QUERY
  // --------------------------------------------------

  describe('project query', () => {
    it('should retrieve an existing project', async () => {
      const suffix = randomUUID();

      const project = await prisma.project.create({
        data: {
          workspaceId: firstWorkspaceId,
          name: `Backend API ${suffix}`,
          slug: `backend-api-${suffix}`,
          description: 'Project retrieval E2E test',
        },
      });

      const response = await getProjectRequest(project.id)
        .expect(200);

      expect(response.body.errors).toBeUndefined();

      const result = response.body.data.project;

      expect(result.id).toBe(project.id);
      expect(result.workspaceId).toBe(firstWorkspaceId);
      expect(result.name).toBe(project.name);
      expect(result.slug).toBe(project.slug);
      expect(result.description).toBe(
        'Project retrieval E2E test',
      );
    });

    it('should return NOT_FOUND for a non-existent project', async () => {
      const response = await getProjectRequest(randomUUID())
        .expect(200);

      expect(response.body.errors).toBeDefined();

      expect(
        response.body.errors[0].extensions.code,
      ).toBe('NOT_FOUND');
    });
  });

  // --------------------------------------------------
  // GET PROJECTS BY WORKSPACE QUERY
  // --------------------------------------------------

  describe('projectsByWorkspace query', () => {
    it('should return paginated projects with total count', async () => {
      const workspace = await createTestWorkspace(
        'Pagination Workspace',
      );

      // Create projects with controlled timestamps.
      const projects = [
        {
          name: 'Older Project',
          slug: 'older-project',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        },
        {
          name: 'Middle Project',
          slug: 'middle-project',
          createdAt: new Date('2026-01-02T00:00:00.000Z'),
        },
        {
          name: 'Newest Project',
          slug: 'newest-project',
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
        },
      ];

      for (const project of projects) {
        await prisma.project.create({
          data: {
            ...project,
            workspaceId: workspace.id,
          },
        });
      }

      const response = await getProjectsByWorkspaceRequest(
        workspace.id,
        0,
        2,
      ).expect(200);

      expect(response.body.errors).toBeUndefined();

      const result = response.body.data.projectsByWorkspace;

      expect(result.totalCount).toBe(3);
      expect(result.items).toHaveLength(2);

      // Verify newest-first ordering.
      expect(result.items[0].name).toBe('Newest Project');
      expect(result.items[1].name).toBe('Middle Project');
    });

    it('should return an empty list when workspace has no projects', async () => {
      const workspace = await createTestWorkspace(
        'Empty Workspace',
      );

      const response = await getProjectsByWorkspaceRequest(
        workspace.id,
      ).expect(200);

      expect(response.body.errors).toBeUndefined();

      const result = response.body.data.projectsByWorkspace;

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should return NOT_FOUND for a non-existent workspace', async () => {
      const response = await getProjectsByWorkspaceRequest(
        randomUUID(),
      ).expect(200);

      expect(response.body.errors).toBeDefined();

      expect(
        response.body.errors[0].extensions.code,
      ).toBe('NOT_FOUND');
    });
  });
});
