
import { describe, it, expect } from 'vitest';

import {
  Workspace,
  InvalidWorkspaceError,
} from './workspace.entity.js';

describe('Workspace', () => {
  const validProps = {
    id: 'workspace-123',
    name: 'Development Team',
    slug: 'development-team',
    description: 'Workspace for developers',
  };

  describe('create()', () => {
    it('should create a workspace successfully', () => {
      const workspace = Workspace.create(validProps);

      expect(workspace).toBeInstanceOf(Workspace);
      expect(workspace.name).toBe('Development Team');
      expect(workspace.slug).toBe('development-team');
      expect(workspace.description).toBe('Workspace for developers');
    });

    it('should trim whitespace from workspace name', () => {
      const workspace = Workspace.create({
        ...validProps,
        name: '  Development Team  ',
      });

      expect(workspace.name).toBe('Development Team');
    });

    it('should normalize empty description to null', () => {
      const workspace = Workspace.create({
        ...validProps,
        description: '   ',
      });

      expect(workspace.description).toBeNull();
    });

    it('should reject an empty workspace name', () => {
      expect(() =>
        Workspace.create({
          ...validProps,
          name: '   ',
        }),
      ).toThrow(InvalidWorkspaceError);
    });

    it('should reject a workspace name longer than 120 characters', () => {
      expect(() =>
        Workspace.create({
          ...validProps,
          name: 'a'.repeat(121),
        }),
      ).toThrow(InvalidWorkspaceError);
    });

    it('should reject an empty slug', () => {
      expect(() =>
        Workspace.create({
          ...validProps,
          slug: '',
        }),
      ).toThrow(InvalidWorkspaceError);
    });

    it('should reject a description longer than 500 characters', () => {
      expect(() =>
        Workspace.create({
          ...validProps,
          description: 'a'.repeat(501),
        }),
      ).toThrow(InvalidWorkspaceError);
    });

    it('should generate creation and update timestamps', () => {
      const workspace = Workspace.create(validProps);

      expect(workspace.createdAt).toBeInstanceOf(Date);
      expect(workspace.updatedAt).toBeInstanceOf(Date);
      expect(workspace.createdAt.getTime()).toBe(
        workspace.updatedAt.getTime(),
      );
    });
  });
});
