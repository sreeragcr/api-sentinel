
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { CredentialNotFoundError } from '../../application/errors/credential-not-found.error.js';
import { DuplicateCredentialError } from '../../application/errors/duplicate-credential.error.js';
import type { CredentialRepository } from '../../application/ports/credential.repository.js';

import { Credential } from '../../domain/entities/credential.entity.js';
import { CredentialType } from '../../domain/enums/credential-type.enum.js';

@Injectable()
export class PrismaCredentialRepository implements CredentialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(credential: Credential): Promise<Credential> {
    try {
      const record = await this.prisma.credential.create({
        data: this.persistenceData(credential),
      });

      return this.toDomainEntity(record);
    } catch (error: unknown) {
      if (this.hasCode(error, 'P2002')) {
        throw new DuplicateCredentialError(
          credential.workspaceId,
          credential.name,
        );
      }

      throw error;
    }
  }

  async update(credential: Credential): Promise<Credential> {
    try {
      const record = await this.prisma.credential.update({
        where: {
          id: credential.id,
          workspaceId: credential.workspaceId,
        },
        data: {
          name: credential.name,
          encryptedValue: credential.encryptedValue,
        },
      });

      return this.toDomainEntity(record);
    } catch (error: unknown) {
      if (this.hasCode(error, 'P2002')) {
        throw new DuplicateCredentialError(
          credential.workspaceId,
          credential.name,
        );
      }

      if (this.hasCode(error, 'P2025')) {
        throw new CredentialNotFoundError(credential.id);
      }

      throw error;
    }
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const result = await this.prisma.credential.deleteMany({
      where: { id, workspaceId },
    });

    if (result.count === 0) {
      throw new CredentialNotFoundError(id);
    }
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<Credential | null> {
    const record = await this.prisma.credential.findFirst({
      where: { id, workspaceId },
    });

    return record ? this.toDomainEntity(record) : null;
  }

  async findByWorkspaceId(workspaceId: string): Promise<Credential[]> {
    const records = await this.prisma.credential.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    return records.map((record) => this.toDomainEntity(record));
  }

  async findByWorkspaceIdAndName(
    workspaceId: string,
    name: string,
  ): Promise<Credential | null> {
    const record = await this.prisma.credential.findUnique({
      where: {
        workspaceId_name: { workspaceId, name },
      },
    });

    return record ? this.toDomainEntity(record) : null;
  }

  private persistenceData(credential: Credential) {
    return {
      id: credential.id,
      workspaceId: credential.workspaceId,
      name: credential.name,
      type: credential.type,
      encryptedValue: credential.encryptedValue,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  private toDomainEntity(record: {
    id: string;
    workspaceId: string;
    name: string;
    type: string;
    encryptedValue: string;
    createdAt: Date;
    updatedAt: Date;
  }): Credential {
    return Credential.reconstitute({
      ...record,
      type: record.type as CredentialType,
    });
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
