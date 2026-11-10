
import { describe, it, expect } from 'vitest';

import {
  Project,
  InvalidProjectError,
} from './project.entity.js';

describe('Project', () => {
  const validProps = {
    id: 'project-123',
    workspaceId: 'workspace-123',
    name: 'Backend API',
    slug: 'backend-api',
    description: 'Backend API testing project',
  };

  const createProject = () => Project.create(validProps);

  // --------------------------------------------------
  // CREATE
  // --------------------------------------------------

  describe('create()', () => {
    it('should create a project successfully', () => {
      const project = Project.create(validProps);

      expect(project).toBeInstanceOf(Project);
      expect(project.name).toBe('Backend API');
      expect(project.workspaceId).toBe('workspace-123');
      expect(project.slug).toBe('backend-api');
      expect(project.description).toBe(
        'Backend API testing project',
      );
    });

    it('should reject an empty workspace ID', () => {
      expect(() =>
        Project.create({
          ...validProps,
          workspaceId: '   ',
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should trim whitespace from project name', () => {
      const project = Project.create({
        ...validProps,
        name: '  Backend API  ',
      });

      expect(project.name).toBe('Backend API');
    });

    it('should reject an empty project name', () => {
      expect(() =>
        Project.create({
          ...validProps,
          name: '   ',
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should reject a project name longer than 120 characters', () => {
      expect(() =>
        Project.create({
          ...validProps,
          name: 'a'.repeat(121),
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should reject an invalid slug', () => {
      expect(() =>
        Project.create({
          ...validProps,
          slug: '',
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should convert empty description to null', () => {
      const project = Project.create({
        ...validProps,
        description: '   ',
      });

      expect(project.description).toBeNull();
    });

    it('should reject a description longer than 500 characters', () => {
      expect(() =>
        Project.create({
          ...validProps,
          description: 'a'.repeat(501),
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should initialize creation and update timestamps', () => {
      const project = createProject();

      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);

      expect(project.createdAt.getTime()).toBe(
        project.updatedAt.getTime(),
      );
    });
  });

  // --------------------------------------------------
  // UPDATE DETAILS
  // --------------------------------------------------

  describe('updateDetails()', () => {
    it('should update project details successfully', () => {
      const project = createProject();

      const updated = project.updateDetails({
        name: 'Backend API Testing',
        slug: 'backend-api-testing',
        description: 'Updated project description',
      });

      expect(updated).toBeInstanceOf(Project);
      expect(updated.name).toBe('Backend API Testing');
      expect(updated.slug).toBe('backend-api-testing');
      expect(updated.description).toBe(
        'Updated project description',
      );
    });

    it('should preserve project identity and workspace relationship', () => {
      const project = createProject();

      const updated = project.updateDetails({
        description: 'Updated description',
      });

      expect(updated.id).toBe(project.id);
      expect(updated.workspaceId).toBe(project.workspaceId);
      expect(updated.createdAt).toBe(project.createdAt);
    });

    it('should preserve unchanged fields', () => {
      const project = createProject();

      const updated = project.updateDetails({
        description: 'Updated description',
      });

      expect(updated.name).toBe(project.name);
      expect(updated.slug).toBe(project.slug);
    });

    it('should trim whitespace from updated project name', () => {
      const project = createProject();

      const updated = project.updateDetails({
        name: '  Backend API Testing  ',
        slug: 'backend-api-testing',
      });

      expect(updated.name).toBe('Backend API Testing');
    });

    it('should clear description when null is provided', () => {
      const project = createProject();

      const updated = project.updateDetails({
        description: null,
      });

      expect(updated.description).toBeNull();
    });

    it('should convert empty description to null', () => {
      const project = createProject();

      const updated = project.updateDetails({
        description: '   ',
      });

      expect(updated.description).toBeNull();
    });

    it('should reject an empty project name', () => {
      const project = createProject();

      expect(() =>
        project.updateDetails({
          name: '   ',
          slug: 'invalid-slug',
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should reject a project name longer than 120 characters', () => {
      const project = createProject();

      expect(() =>
        project.updateDetails({
          name: 'a'.repeat(121),
          slug: 'a'.repeat(60),
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should reject a description longer than 500 characters', () => {
      const project = createProject();

      expect(() =>
        project.updateDetails({
          description: 'a'.repeat(501),
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should reject updating name without its slug', () => {
      const project = createProject();

      expect(() =>
        project.updateDetails({
          name: 'Updated Project',
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should reject updating slug without its name', () => {
      const project = createProject();

      expect(() =>
        project.updateDetails({
          slug: 'updated-project',
        }),
      ).toThrow(InvalidProjectError);
    });

    it('should return a new Project instance with an updated timestamp', () => {
      const project = createProject();

      const updated = project.updateDetails({
        description: 'Updated description',
      });

      expect(updated).not.toBe(project);
      expect(updated.updatedAt).toBeInstanceOf(Date);
      expect(updated.updatedAt).not.toBe(project.updatedAt);
    });
  });
});
