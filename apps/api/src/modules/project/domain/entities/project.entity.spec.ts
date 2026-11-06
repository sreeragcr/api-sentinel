
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

  describe('create()', () => {
    it('should create a project successfully', () => {
      const project = Project.create(validProps);

      expect(project).toBeInstanceOf(Project);
      expect(project.name).toBe('Backend API');
      expect(project.workspaceId).toBe('workspace-123');
      expect(project.slug).toBe('backend-api');
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
      const project = Project.create(validProps);

      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
      expect(project.createdAt.getTime()).toBe(
        project.updatedAt.getTime(),
      );
    });
  });
});
