// Prisma workspace repository.

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { Workspace } from '../../domain/entities/workspace.entity.js';

import { WorkspaceRepository } from '../../application/ports/workspace.repository.js';

import { WorkspaceSlugAlreadyExistsError } from '../../application/errors/workspace-slug-already-exists.error.js';

@Injectable()
export class PrismaWorkspaceRepository implements WorkspaceRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async save(workspace: Workspace): Promise<Workspace> {
    try {
      const record = await this.prisma.workspace.create({
        data: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          description: workspace.description,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        },
      });

      return Workspace.reconstitute({
        id: record.id,
        name: record.name,
        slug: record.slug,
        description: record.description,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new WorkspaceSlugAlreadyExistsError(
          workspace.slug,
        );
      }

      throw error;
    }
  }
}
