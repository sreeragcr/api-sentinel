
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { PrismaWorkspaceExistenceChecker } from './prisma-workspace-existence-checker.js';

describe('PrismaWorkspaceExistenceChecker', () => {
  const findUnique = vi.fn();

  const prisma = {
    workspace: { findUnique },
  };

  let checker: PrismaWorkspaceExistenceChecker;

  beforeEach(() => {
    findUnique.mockReset();

    checker = new PrismaWorkspaceExistenceChecker(
      prisma as unknown as PrismaService,
    );
  });

  it('returns true when the workspace exists', async () => {
    findUnique.mockResolvedValue({ id: 'workspace-123' });

    await expect(checker.existsById('workspace-123')).resolves.toBe(true);

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'workspace-123' },
      select: { id: true },
    });
  });

  it('returns false when the workspace does not exist', async () => {
    findUnique.mockResolvedValue(null);

    await expect(checker.existsById('missing-workspace')).resolves.toBe(
      false,
    );
  });

  it('propagates unexpected database errors', async () => {
    const error = new Error('Database unavailable');
    findUnique.mockRejectedValue(error);

    await expect(checker.existsById('workspace-123')).rejects.toBe(error);
  });
});
