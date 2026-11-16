
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import {
  Prisma,
} from '../../../../generated/prisma/client.js';

import {
  RestRequestConfiguration,
} from '../../domain/entities/rest-request-configuration.entity.js';

import {
  RestRequestConfigurationRepository,
} from '../../application/ports/rest-request-configuration.repository.js';

import {
  AuthenticationConfig,
  QueryParameter,
  PathParameter,
  RequestHeader,
  RequestBody,
} from '../../domain/entities/rest-request-configuration.entity.js';

@Injectable()
export class PrismaRestRequestConfigurationRepository
  implements RestRequestConfigurationRepository
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async save(
    configuration: RestRequestConfiguration,
  ): Promise<RestRequestConfiguration> {
    const record = await this.prisma.restRequestConfiguration.upsert({
      where: {
        endpointId: configuration.endpointId,
      },
      create: {
        id: configuration.id,
        endpointId: configuration.endpointId,
        queryParameters: this.toPrismaJson(
          configuration.queryParameters,
        ),
        pathParameters: this.toPrismaJson(
          configuration.pathParameters,
        ),
        headers: this.toPrismaJson(configuration.headers),
        authentication: this.toPrismaJson(
          configuration.authentication,
        ),
        body: this.toPrismaJson(configuration.body),
        createdAt: configuration.createdAt,
        updatedAt: configuration.updatedAt,
      },
      update: {
        queryParameters: this.toPrismaJson(
          configuration.queryParameters,
        ),
        pathParameters: this.toPrismaJson(
          configuration.pathParameters,
        ),
        headers: this.toPrismaJson(configuration.headers),
        authentication: this.toPrismaJson(
          configuration.authentication,
        ),
        body: this.toPrismaJson(configuration.body),
        updatedAt: configuration.updatedAt,
      },
    });

    return this.toDomainEntity(record);
  }

  async findByEndpointId(
    endpointId: string,
  ): Promise<RestRequestConfiguration | null> {
    const record =
      await this.prisma.restRequestConfiguration.findUnique({
        where: {
          endpointId,
        },
      });

    if (!record) {
      return null;
    }

    return this.toDomainEntity(record);
  }

  private toPrismaJson(
    value: unknown,
  ): Prisma.InputJsonValue {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.toPrismaJson(item));
    }

    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value).map(
        ([key, item]) => [key, this.toPrismaJson(item)],
      );

      return Object.fromEntries(
        entries,
      ) as Prisma.InputJsonObject;
    }

    throw new Error('Unsupported value in REST request configuration JSON');
  }

  private toDomainEntity(
    record: {
      id: string;
      endpointId: string;
      queryParameters: Prisma.JsonValue;
      pathParameters: Prisma.JsonValue;
      headers: Prisma.JsonValue;
      authentication: Prisma.JsonValue;
      body: Prisma.JsonValue;
      createdAt: Date;
      updatedAt: Date;
    },
  ): RestRequestConfiguration {
    return RestRequestConfiguration.reconstitute({
      id: record.id,
      endpointId: record.endpointId,
      queryParameters:
        record.queryParameters as unknown as QueryParameter[],
      pathParameters:
        record.pathParameters as unknown as PathParameter[],
      headers:
        record.headers as unknown as RequestHeader[],
      authentication:
        record.authentication as unknown as AuthenticationConfig,
      body:
        record.body as unknown as RequestBody,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
