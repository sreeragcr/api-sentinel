import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';
import { ApiEnvironmentNotFoundError } from '../../application/errors/api-environment-not-found.error.js';
import { DuplicateApiEnvironmentError } from '../../application/errors/duplicate-api-environment.error.js';
import { ApiEnvironmentRepository } from '../../application/ports/api-environment.repository.js';
import { ApiEnvironment } from '../../domain/entities/api-environment.entity.js';

@Injectable()
export class PrismaApiEnvironmentRepository implements ApiEnvironmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(environment: ApiEnvironment): Promise<ApiEnvironment> {
    try {
      return this.toDomainEntity(
        await this.prisma.apiEnvironment.create({
          data: this.persistenceData(environment),
        }),
      );
    } catch (error: unknown) {
      this.throwMappedSaveError(error, environment);
    }
  }

  async update(environment: ApiEnvironment): Promise<ApiEnvironment> {
    try {
      return this.toDomainEntity(
        await this.prisma.apiEnvironment.update({
          where: { id: environment.id },
          data: {
            name: environment.name,
            baseUrl: environment.baseUrl,
            description: environment.description,
          },
        }),
      );
    } catch (error: unknown) {
      if (this.hasCode(error, 'P2002'))
        throw new DuplicateApiEnvironmentError(
          environment.apiDefinitionId,
          environment.name,
        );
      if (this.hasCode(error, 'P2025'))
        throw new ApiEnvironmentNotFoundError(environment.id);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.apiEnvironment.delete({ where: { id } });
    } catch (error: unknown) {
      if (this.hasCode(error, 'P2025'))
        throw new ApiEnvironmentNotFoundError(id);
      throw error;
    }
  }

  async findById(id: string): Promise<ApiEnvironment | null> {
    const record = await this.prisma.apiEnvironment.findUnique({
      where: { id },
    });
    return record ? this.toDomainEntity(record) : null;
  }

  async findByApiDefinitionIdAndName(
    apiDefinitionId: string,
    name: string,
  ): Promise<ApiEnvironment | null> {
    const record = await this.prisma.apiEnvironment.findUnique({
      where: { apiDefinitionId_name: { apiDefinitionId, name } },
    });
    return record ? this.toDomainEntity(record) : null;
  }

  async findByApiDefinitionId(
    apiDefinitionId: string,
  ): Promise<ApiEnvironment[]> {
    const records = await this.prisma.apiEnvironment.findMany({
      where: { apiDefinitionId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
    return records.map((record) => this.toDomainEntity(record));
  }

  private persistenceData(environment: ApiEnvironment) {
    return {
      id: environment.id,
      apiDefinitionId: environment.apiDefinitionId,
      name: environment.name,
      baseUrl: environment.baseUrl,
      description: environment.description,
      createdAt: environment.createdAt,
      updatedAt: environment.updatedAt,
    };
  }

  private toDomainEntity(record: {
    id: string;
    apiDefinitionId: string;
    name: string;
    baseUrl: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ApiEnvironment {
    return ApiEnvironment.reconstitute(record);
  }

  private throwMappedSaveError(
    error: unknown,
    environment: ApiEnvironment,
  ): never {
    if (this.hasCode(error, 'P2002'))
      throw new DuplicateApiEnvironmentError(
        environment.apiDefinitionId,
        environment.name,
      );
    throw error;
  }

  private hasCode(error: unknown, code: string): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === code
    );
  }
}
