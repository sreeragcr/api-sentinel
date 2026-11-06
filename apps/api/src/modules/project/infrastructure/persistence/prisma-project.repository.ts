
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { Project } from '../../domain/entities/project.entity.js';

import { ProjectRepository } from '../../application/ports/project.repository.js';

import { ProjectSlugAlreadyExistsError } from '../../application/errors/project-slug-already-exists.error.js';

import { WorkspaceNotFoundError } from '../../application/errors/workspace-not-found.error.js';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async save(project: Project): Promise<Project> {
    try {
      const record = await this.prisma.project.create({
        data: {
          id: project.id,
          workspaceId: project.workspaceId,
          name: project.name,
          slug: project.slug,
          description: project.description,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      });

      return Project.reconstitute({
        id: record.id,
        workspaceId: record.workspaceId,
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
        throw new ProjectSlugAlreadyExistsError(
          project.workspaceId,
          project.slug,
        );
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2003'
      ) {
        throw new WorkspaceNotFoundError(
          project.workspaceId,
        );
      }

      throw error;
    }
  }
}
