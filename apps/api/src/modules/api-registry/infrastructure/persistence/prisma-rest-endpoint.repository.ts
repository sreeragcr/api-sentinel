import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { RestEndpointNotFoundError } from '../../application/errors/rest-endpoint-not-found.error.js';

import {
  HttpMethod as PrismaHttpMethod,
} from '../../../../generated/prisma/client.js';

import {
  RestEndpoint,
} from '../../domain/entities/rest-endpoint.entity.js';

import {
  HttpMethod,
} from '../../domain/enums/http-method.enum.js';

import {
  RestEndpointRepository,
} from '../../application/ports/rest-endpoint.repository.js';

import {
  DuplicateRestEndpointError,
} from '../../application/errors/duplicate-rest-endpoint.error.js';

import {
  ApiDefinitionNotFoundError,
} from '../../application/errors/api-definition-not-found.error.js';

@Injectable()
export class PrismaRestEndpointRepository
  implements RestEndpointRepository {

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async save(restEndpoint: RestEndpoint): Promise<RestEndpoint> {
    try {
      const record = await this.prisma.restEndpoint.create({
        data: {
          id: restEndpoint.id,
          apiDefinitionId: restEndpoint.apiDefinitionId,
          name: restEndpoint.name,
          description: restEndpoint.description,
          method: this.toPrismaHttpMethod(restEndpoint.method),
          path: restEndpoint.path,
          createdAt: restEndpoint.createdAt,
          updatedAt: restEndpoint.updatedAt,
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
        throw new DuplicateRestEndpointError(
          restEndpoint.apiDefinitionId,
          restEndpoint.method,
          restEndpoint.path,
        );
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2003'
      ) {
        throw new ApiDefinitionNotFoundError(
          restEndpoint.apiDefinitionId,
        );
      }

      throw error;
    }
  }


  async update(restEndpoint: RestEndpoint): Promise<RestEndpoint> {
    try {
      const record = await this.prisma.restEndpoint.update({
        where: {
          id: restEndpoint.id,
        },
        data: {
          name: restEndpoint.name,
          description: restEndpoint.description,
          method: this.toPrismaHttpMethod(restEndpoint.method),
          path: restEndpoint.path,
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
        throw new DuplicateRestEndpointError(
          restEndpoint.apiDefinitionId,
          restEndpoint.method,
          restEndpoint.path,
        );
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        throw new RestEndpointNotFoundError(restEndpoint.id);
      }

      throw error;
    }
  }


  async findById(id: string): Promise<RestEndpoint | null> {
    const record = await this.prisma.restEndpoint.findUnique({
      where: {
        id,
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomainEntity(record);
  }

  async findByApiDefinitionIdAndMethodAndPath(
    apiDefinitionId: string,
    method: HttpMethod,
    path: string,
  ): Promise<RestEndpoint | null> {
    const record = await this.prisma.restEndpoint.findUnique({
      where: {
        apiDefinitionId_method_path: {
          apiDefinitionId,
          method: this.toPrismaHttpMethod(method),
          path,
        },
      },
    });

    if (!record) {
      return null;
    }

    return this.toDomainEntity(record);
  }


  async findByApiDefinitionId(
    apiDefinitionId: string,
    options: {
      offset: number;
      limit: number;
    },
  ): Promise<{
    items: RestEndpoint[];
    totalCount: number;
  }> {
    const where = {
      apiDefinitionId,
    };

    const [records, totalCount] = await Promise.all([
      this.prisma.restEndpoint.findMany({
        where,
        skip: options.offset,
        take: options.limit,
        orderBy: [
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
      }),

      this.prisma.restEndpoint.count({
        where,
      }),
    ]);

    return {
      items: records.map((record) =>
        this.toDomainEntity(record),
      ),
      totalCount,
    };
  }


  private toDomainEntity(
    record: {
      id: string;
      apiDefinitionId: string;
      name: string;
      description: string | null;
      method: PrismaHttpMethod;
      path: string;
      createdAt: Date;
      updatedAt: Date;
    },
  ): RestEndpoint {
    return RestEndpoint.reconstitute({
      id: record.id,
      apiDefinitionId: record.apiDefinitionId,
      name: record.name,
      description: record.description,
      method: this.toDomainHttpMethod(record.method),
      path: record.path,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toPrismaHttpMethod(
    method: HttpMethod,
  ): PrismaHttpMethod {
    switch (method) {
      case HttpMethod.GET:
        return PrismaHttpMethod.GET;
      case HttpMethod.POST:
        return PrismaHttpMethod.POST;
      case HttpMethod.PUT:
        return PrismaHttpMethod.PUT;
      case HttpMethod.PATCH:
        return PrismaHttpMethod.PATCH;
      case HttpMethod.DELETE:
        return PrismaHttpMethod.DELETE;
      case HttpMethod.HEAD:
        return PrismaHttpMethod.HEAD;
      case HttpMethod.OPTIONS:
        return PrismaHttpMethod.OPTIONS;
    }
  }

  private toDomainHttpMethod(
    method: PrismaHttpMethod,
  ): HttpMethod {
    switch (method) {
      case PrismaHttpMethod.GET:
        return HttpMethod.GET;
      case PrismaHttpMethod.POST:
        return HttpMethod.POST;
      case PrismaHttpMethod.PUT:
        return HttpMethod.PUT;
      case PrismaHttpMethod.PATCH:
        return HttpMethod.PATCH;
      case PrismaHttpMethod.DELETE:
        return HttpMethod.DELETE;
      case PrismaHttpMethod.HEAD:
        return HttpMethod.HEAD;
      case PrismaHttpMethod.OPTIONS:
        return HttpMethod.OPTIONS;
    }
  }
}
