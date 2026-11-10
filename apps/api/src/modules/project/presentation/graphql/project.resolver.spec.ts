import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BadRequestException } from '@nestjs/common';

import { ProjectResolver } from './project.resolver.js';

import type {
  CreateProjectUseCase,
} from '../../application/use-cases/create-project.use-case.js';

import type {
  GetProjectByIdUseCase,
} from '../../application/use-cases/get-project-by-id.use-case.js';

import type {
  GetProjectsByWorkspaceUseCase,
} from '../../application/use-cases/get-projects-by-workspace.use-case.js';

import type {
  UpdateProjectUseCase,
} from '../../application/use-cases/update-project.use-case.js';

import {
  DeleteProjectUseCase
} from '../../application/use-cases/delete-project.use-case.js';

import {
  Project,
  InvalidProjectError,
} from '../../domain/entities/project.entity.js';

import {
  ProjectSlugAlreadyExistsError,
} from '../../application/errors/project-slug-already-exists.error.js';

import {
  ProjectNotFoundError,
} from '../../application/errors/project-not-found.error.js';

import {
  WorkspaceNotFoundError,
} from '../../application/errors/workspace-not-found.error.js';
import { RestoreProjectUseCase } from '../../application/use-cases/restore-project.use-case.js';

describe('ProjectResolver', () => {
  // Create Project use case mock
  const execute = vi.fn<CreateProjectUseCase['execute']>();

  // Get Project by ID use case mock
  const getProjectById =
    vi.fn<GetProjectByIdUseCase['execute']>();

  // Get Projects by Workspace use case mock
  const getProjectsByWorkspace =
    vi.fn<GetProjectsByWorkspaceUseCase['execute']>();

  // Update Project use case mock
  const updateProject =
    vi.fn<UpdateProjectUseCase['execute']>();

  // Mock use case dependencies
  const useCase = {
    execute,
  } as unknown as CreateProjectUseCase;

  const getProjectByIdUseCase = {
    execute: getProjectById,
  } as unknown as GetProjectByIdUseCase;

  const getProjectsByWorkspaceUseCase = {
    execute: getProjectsByWorkspace,
  } as unknown as GetProjectsByWorkspaceUseCase;

  const updateProjectUseCase = {
    execute: updateProject,
  } as unknown as UpdateProjectUseCase;

  const deleteProjectUseCase = {
    execute: vi.fn(),
  } as unknown as DeleteProjectUseCase;

  let resolver: ProjectResolver;

  const input = {
    workspaceId: 'workspace-123',
    name: 'Backend API',
    description: 'Backend API testing project',
  };

  const updateInput = {
    projectId: 'project-123',
    name: 'Updated Backend API',
  };

  const restoreProjectUseCase = {
    execute: vi.fn(),
  } as unknown as RestoreProjectUseCase;

  const createProject = (
    id = 'project-123',
    name = 'Backend API',
    slug = 'backend-api',
  ) =>
    Project.create({
      id,
      workspaceId: 'workspace-123',
      name,
      slug,
      description: 'Backend API testing project',
    });

  beforeEach(() => {
    execute.mockReset();
    getProjectById.mockReset();
    getProjectsByWorkspace.mockReset();
    updateProject.mockReset();

    resolver = new ProjectResolver(
      useCase,
      getProjectByIdUseCase,
      getProjectsByWorkspaceUseCase,
      updateProjectUseCase,
      deleteProjectUseCase,
      restoreProjectUseCase,
    );
  });

  // --------------------------------------------------
  // CREATE PROJECT MUTATION
  // --------------------------------------------------

  describe('createProject()', () => {
    it('should create a project successfully', async () => {
      const project = createProject();

      execute.mockResolvedValue(project);

      const result = await resolver.createProject(input);

      expect(execute).toHaveBeenCalledWith(input);
      expect(result).toBe(project);
    });

    it('should translate duplicate slug error into GraphQL conflict error', async () => {
      execute.mockRejectedValue(
        new ProjectSlugAlreadyExistsError(
          'workspace-123',
          'backend-api',
        ),
      );

      await expect(
        resolver.createProject(input),
      ).rejects.toMatchObject({
        message:
          'A project with slug "backend-api" already exists in workspace "workspace-123"',
        extensions: {
          code: 'CONFLICT',
        },
      });
    });

    it('should translate workspace not found error into GraphQL NOT_FOUND', async () => {
      execute.mockRejectedValue(
        new WorkspaceNotFoundError('workspace-123'),
      );

      await expect(
        resolver.createProject(input),
      ).rejects.toMatchObject({
        message: 'Workspace "workspace-123" does not exist',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should translate invalid project error into BadRequestException', async () => {
      execute.mockRejectedValue(
        new InvalidProjectError('Invalid project name'),
      );

      await expect(
        resolver.createProject(input),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should propagate unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');

      execute.mockRejectedValue(unexpectedError);

      await expect(
        resolver.createProject(input),
      ).rejects.toBe(unexpectedError);
    });
  });

  // --------------------------------------------------
  // GET PROJECT BY ID QUERY
  // --------------------------------------------------

  describe('getProject()', () => {
    it('should return a project successfully', async () => {
      const project = createProject();

      getProjectById.mockResolvedValue(project);

      const result = await resolver.getProject('project-123');

      expect(getProjectById).toHaveBeenCalledWith('project-123');
      expect(result).toBe(project);
    });

    it('should translate project not found error into GraphQL NOT_FOUND', async () => {
      getProjectById.mockRejectedValue(
        new ProjectNotFoundError('missing-project'),
      );

      await expect(
        resolver.getProject('missing-project'),
      ).rejects.toMatchObject({
        message: 'Project "missing-project" does not exist',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should propagate unexpected errors', async () => {
      const unexpectedError = new Error('Database unavailable');

      getProjectById.mockRejectedValue(unexpectedError);

      await expect(
        resolver.getProject('project-123'),
      ).rejects.toBe(unexpectedError);
    });
  });

  // --------------------------------------------------
  // GET PROJECTS BY WORKSPACE QUERY
  // --------------------------------------------------

  describe('getProjectsByWorkspace()', () => {
    const workspaceInput = {
      workspaceId: 'workspace-123',
      offset: 0,
      limit: 20,
    };

    it('should return projects belonging to a workspace', async () => {
      const projects = [
        createProject(
          'project-123',
          'Backend API',
          'backend-api',
        ),
        createProject(
          'project-456',
          'Frontend App',
          'frontend-app',
        ),
      ];

      const resultData = {
        items: projects,
        totalCount: 2,
      };

      getProjectsByWorkspace.mockResolvedValue(resultData);

      const result = await resolver.getProjectsByWorkspace(
        workspaceInput,
      );

      expect(getProjectsByWorkspace).toHaveBeenCalledWith(
        workspaceInput,
      );

      expect(result.items).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.items[0].name).toBe('Backend API');
      expect(result.items[1].name).toBe('Frontend App');
    });

    it('should return an empty list when workspace has no projects', async () => {
      getProjectsByWorkspace.mockResolvedValue({
        items: [],
        totalCount: 0,
      });

      const result = await resolver.getProjectsByWorkspace(
        workspaceInput,
      );

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should translate workspace not found error into GraphQL NOT_FOUND', async () => {
      getProjectsByWorkspace.mockRejectedValue(
        new WorkspaceNotFoundError('missing-workspace'),
      );

      await expect(
        resolver.getProjectsByWorkspace({
          ...workspaceInput,
          workspaceId: 'missing-workspace',
        }),
      ).rejects.toMatchObject({
        message: 'Workspace "missing-workspace" does not exist',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should propagate unexpected errors', async () => {
      const unexpectedError = new Error('Database unavailable');

      getProjectsByWorkspace.mockRejectedValue(unexpectedError);

      await expect(
        resolver.getProjectsByWorkspace(workspaceInput),
      ).rejects.toBe(unexpectedError);
    });
  });

  // --------------------------------------------------
  // UPDATE PROJECT MUTATION
  // --------------------------------------------------

  describe('updateProject()', () => {
    it('should update a project successfully', async () => {
      const project = createProject(
        'project-123',
        'Updated Backend API',
        'updated-backend-api',
      );

      updateProject.mockResolvedValue(project);

      const result = await resolver.updateProject(updateInput);

      expect(updateProject).toHaveBeenCalledWith(updateInput);
      expect(result).toBe(project);
    });

    it('should translate duplicate slug error into GraphQL CONFLICT', async () => {
      updateProject.mockRejectedValue(
        new ProjectSlugAlreadyExistsError(
          'workspace-123',
          'updated-backend-api',
        ),
      );

      await expect(
        resolver.updateProject(updateInput),
      ).rejects.toMatchObject({
        message:
          'A project with slug "updated-backend-api" already exists in workspace "workspace-123"',
        extensions: {
          code: 'CONFLICT',
        },
      });
    });

    it('should translate project not found error into GraphQL NOT_FOUND', async () => {
      updateProject.mockRejectedValue(
        new ProjectNotFoundError('missing-project'),
      );

      await expect(
        resolver.updateProject({
          ...updateInput,
          projectId: 'missing-project',
        }),
      ).rejects.toMatchObject({
        message: 'Project "missing-project" does not exist',
        extensions: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should translate invalid project error into BadRequestException', async () => {
      updateProject.mockRejectedValue(
        new InvalidProjectError('Invalid project name'),
      );

      await expect(
        resolver.updateProject(updateInput),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should propagate unexpected errors', async () => {
      const unexpectedError = new Error('Database unavailable');

      updateProject.mockRejectedValue(unexpectedError);

      await expect(
        resolver.updateProject(updateInput),
      ).rejects.toBe(unexpectedError);
    });
  });
});
