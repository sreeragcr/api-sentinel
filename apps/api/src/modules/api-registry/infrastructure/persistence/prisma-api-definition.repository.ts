
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import {
  ApiProtocol as PrismaApiProtocol,
} from '../../../../generated/prisma/client.js';

import {
  ApiDefinition,
} from '../../domain/entities/api-definition.entity.js';

import {
  ApiProtocol,
} from '../../domain/enums/api-protocol.enum.js';

import {
  ApiDefinitionRepository,
  ApiDefinitionListOptions,
  ApiDefinitionListResult,
} from '../../application/ports/api-definition.repository.js';

import {
  DuplicateApiDefinitionError,
} from '../../application/errors/duplicate-api-definition.error.js';

import {
  ProjectNotFoundError,
} from '../../application/errors/project-not-found.error.js';

@Injectable()
export class PrismaApiDefinitionRepository
  implements ApiDefinitionRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async save(apiDefinition: ApiDefinition): Promise<ApiDefinition> {
    try {
      const record = await this.prisma.apiDefinition.create({
        data: {
          id: apiDefinition.id,
          projectId: apiDefinition.projectId,
          name: apiDefinition.name,
          description: apiDefinition.description,
          protocol: this.toPrismaProtocol(apiDefinition.protocol),
          createdAt: apiDefinition.createdAt,
          updatedAt: apiDefinition.updatedAt,
        },
      });

      return this.toDomainEntity(record);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new DuplicateApiDefinitionError(
          apiDefinition.projectId,
          apiDefinition.name,
        );
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2003'
      ) {
        throw new ProjectNotFoundError(
          apiDefinition.projectId,
        );
      }

      throw error;
    }
  }

  async findById(id: string): Promise<ApiDefinition | null> {
    const record = await this.prisma.apiDefinition.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomainEntity(record);
  }

  async findByProjectIdAndName(
    projectId: string,
    name: string,
  ): Promise<ApiDefinition | null> {
    const record = await this.prisma.apiDefinition.findUnique({
      where: {
        projectId_name: {
          projectId,
          name,
        },
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomainEntity(record);
  }

  async findByProjectId(
    projectId: string,
    options: ApiDefinitionListOptions,
  ): Promise<ApiDefinitionListResult> {
    const [records, totalCount] = await Promise.all([
      this.prisma.apiDefinition.findMany({
        where: {
          projectId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: options.offset,
        take: options.limit,
      }),

      this.prisma.apiDefinition.count({
        where: {
          projectId,
        },
      }),
    ]);

    return {
      items: records.map((record) => this.toDomainEntity(record)),
      totalCount,
    };
  }

  private toDomainEntity(
    record: {
      id: string;
      projectId: string;
      name: string;
      description: string | null;
      protocol: PrismaApiProtocol;
      createdAt: Date;
      updatedAt: Date;
    },
  ): ApiDefinition {
    return ApiDefinition.reconstitute({
      id: record.id,
      projectId: record.projectId,
      name: record.name,
      description: record.description,
      protocol: this.toDomainProtocol(record.protocol),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPrismaProtocol(
    protocol: ApiProtocol,
  ): PrismaApiProtocol {
    switch (protocol) {
      case ApiProtocol.REST:
        return PrismaApiProtocol.REST;

      case ApiProtocol.GRAPHQL:
        return PrismaApiProtocol.GRAPHQL;

      case ApiProtocol.GRPC:
        return PrismaApiProtocol.GRPC;
    }
  }

  private toDomainProtocol(
    protocol: PrismaApiProtocol,
  ): ApiProtocol {
    switch (protocol) {
      case PrismaApiProtocol.REST:
        return ApiProtocol.REST;

      case PrismaApiProtocol.GRAPHQL:
        return ApiProtocol.GRAPHQL;

      case PrismaApiProtocol.GRPC:
        return ApiProtocol.GRPC;
    }
  }
}
