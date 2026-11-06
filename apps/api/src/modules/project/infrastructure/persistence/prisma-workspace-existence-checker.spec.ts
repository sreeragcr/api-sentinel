
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaWorkspaceExistenceChecker } from './prisma-workspace-existence-checker.js';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

describe('PrismaWorkspaceExistenceChecker', () => {
  const findUnique = vi.fn();

  const prisma = {
    workspace: {
      findUnique,
    },
  } as unknown as PrismaService;

  let checker: PrismaWorkspaceExistenceChecker;

  beforeEach(() => {
    findUnique.mockReset();
    checker = new PrismaWorkspaceExistenceChecker(prisma);
  });

  describe('existsById()', () => {
    it('should return true when workspace exists', async () => {
      findUnique.mockResolvedValue({
        id: 'workspace-123',
      });

      const result = await checker.existsById('workspace-123');

      expect(result).toBe(true);

      expect(findUnique).toHaveBeenCalledWith({
        where: {
          id: 'workspace-123',
        },
        select: {
          id: true,
        },
      });
    });

    it('should return false when workspace does not exist', async () => {
      findUnique.mockResolvedValue(null);

      const result = await checker.existsById('missing-workspace');

      expect(result).toBe(false);
    });

    it('should propagate database errors', async () => {
      const databaseError = new Error('Database unavailable');

      findUnique.mockRejectedValue(databaseError);

      await expect(
        checker.existsById('workspace-123'),
      ).rejects.toBe(databaseError);
    });
  });
});
