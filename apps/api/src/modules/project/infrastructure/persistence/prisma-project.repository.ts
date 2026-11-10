
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { Project } from '../../domain/entities/project.entity.js';

import {
    ProjectRepository,
    ProjectListOptions,
    ProjectListResult,
} from '../../application/ports/project.repository.js';

import { ProjectSlugAlreadyExistsError } from '../../application/errors/project-slug-already-exists.error.js';

import { WorkspaceNotFoundError } from '../../application/errors/workspace-not-found.error.js';
import { ProjectNotFoundError } from '../../application/errors/project-not-found.error.js';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

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
                    deletedAt: project.deletedAt,
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
                deletedAt: record.deletedAt,
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

    async update(project: Project): Promise<Project> {
        try {
            const record = await this.prisma.project.update({
                where: {
                    id: project.id,
                },
                data: {
                    name: project.name,
                    slug: project.slug,
                    description: project.description,
                    updatedAt: project.updatedAt,
                    deletedAt: project.deletedAt,
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
                deletedAt: record.deletedAt,
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
                error.code === 'P2025'
            ) {
                throw new ProjectNotFoundError(project.id);
            }

            throw error;
        }
    }

    async findById(id: string): Promise<Project | null> {
        const record = await this.prisma.project.findUnique({
            where: {
                id,
            },
        });

        if (!record) {
            return null;
        }

        return Project.reconstitute({
            id: record.id,
            workspaceId: record.workspaceId,
            name: record.name,
            slug: record.slug,
            description: record.description,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            deletedAt: record.deletedAt,
        });
    }

    async findByWorkspaceId(
        workspaceId: string,
        options: ProjectListOptions,
    ): Promise<ProjectListResult> {
        const where = {
            workspaceId,
            deletedAt: null,
        };

        const [records, totalCount] = await Promise.all([
            this.prisma.project.findMany({
                where,
                skip: options.offset,
                take: options.limit,
                orderBy: [
                    { createdAt: 'desc' },
                    { id: 'desc' },
                ],
            }),

            this.prisma.project.count({
                where,
            }),
        ]);

        const items = records.map((record) =>
            Project.reconstitute({
                id: record.id,
                workspaceId: record.workspaceId,
                name: record.name,
                slug: record.slug,
                description: record.description,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                deletedAt: record.deletedAt,
            }),
        );

        return {
            items,
            totalCount,
        };
    }

    async findDeletedByWorkspaceId(
        workspaceId: string,
        options: ProjectListOptions,
    ): Promise<ProjectListResult> {
        const where = {
            workspaceId,
            deletedAt: {
                not: null,
            },
        };

        const [records, totalCount] = await Promise.all([
            this.prisma.project.findMany({
                where,
                skip: options.offset,
                take: options.limit,
                orderBy: [
                    { deletedAt: 'desc' },
                    { id: 'desc' },
                ],
            }),

            this.prisma.project.count({
                where,
            }),
        ]);

        const items = records.map((record) =>
            Project.reconstitute({
                id: record.id,
                workspaceId: record.workspaceId,
                name: record.name,
                slug: record.slug,
                description: record.description,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                deletedAt: record.deletedAt,
            }),
        );

        return {
            items,
            totalCount,
        };
    }

    async deleteById(id: string): Promise<void> {
        try {
            await this.prisma.project.delete({
                where: {
                    id,
                },
            });
        } catch (error: unknown) {
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'P2025'
            ) {
                throw new ProjectNotFoundError(id);
            }

            throw error;
        }
    }
}
