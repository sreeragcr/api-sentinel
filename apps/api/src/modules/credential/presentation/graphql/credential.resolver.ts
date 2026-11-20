
import { BadRequestException } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { CreateCredentialUseCase } from '../../application/use-cases/create-credential.use-case.js';
import { GetCredentialByIdUseCase } from '../../application/use-cases/get-credential-by-id.use-case.js';
import { GetCredentialsByWorkspaceUseCase } from '../../application/use-cases/get-credentials-by-workspace.use-case.js';
import { UpdateCredentialUseCase } from '../../application/use-cases/update-credential.use-case.js';

import { DuplicateCredentialError } from '../../application/errors/duplicate-credential.error.js';
import { CredentialNotFoundError } from '../../application/errors/credential-not-found.error.js';
import { WorkspaceNotFoundError } from '../../application/errors/workspace-not-found.error.js';
import { CredentialTypeMismatchError } from '../../application/errors/credential-type-mismatch.error.js';

import { InvalidCredentialError } from '../../domain/entities/credential.entity.js';
import { CredentialType } from '../../domain/enums/credential-type.enum.js';

import { CreateBearerCredentialInput } from './inputs/create-bearer-credential.input.js';
import { CreateBasicCredentialInput } from './inputs/create-basic-credential.input.js';
import { CreateApiKeyCredentialInput } from './inputs/create-api-key-credential.input.js';

import { UpdateBearerCredentialInput } from './inputs/update-bearer-credential.input.js';
import { UpdateBasicCredentialInput } from './inputs/update-basic-credential.input.js';
import { UpdateApiKeyCredentialInput } from './inputs/update-api-key-credential.input.js';

import { CredentialModel } from './models/credential.model.js';

import './enums/credential-type.enum.js';

@Resolver(() => CredentialModel)
export class CredentialResolver {
  constructor(
    private readonly createCredentialUseCase: CreateCredentialUseCase,
    private readonly getCredentialByIdUseCase: GetCredentialByIdUseCase,
    private readonly getCredentialsByWorkspaceUseCase: GetCredentialsByWorkspaceUseCase,
    private readonly updateCredentialUseCase: UpdateCredentialUseCase,
  ) { }

  // --------------------------------------------------
  // CREATE CREDENTIAL MUTATIONS
  // --------------------------------------------------

  @Mutation(() => CredentialModel)
  async createBearerCredential(
    @Args('input') input: CreateBearerCredentialInput,
  ): Promise<CredentialModel> {
    return this.execute(() =>
      this.createCredentialUseCase.execute({
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.BEARER,
          token: input.token,
        },
      }),
    );
  }

  @Mutation(() => CredentialModel)
  async createBasicCredential(
    @Args('input') input: CreateBasicCredentialInput,
  ): Promise<CredentialModel> {
    return this.execute(() =>
      this.createCredentialUseCase.execute({
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.BASIC,
          username: input.username,
          password: input.password,
        },
      }),
    );
  }

  @Mutation(() => CredentialModel)
  async createApiKeyCredential(
    @Args('input') input: CreateApiKeyCredentialInput,
  ): Promise<CredentialModel> {
    return this.execute(() =>
      this.createCredentialUseCase.execute({
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.API_KEY,
          value: input.value,
        },
      }),
    );
  }

  // --------------------------------------------------
  // UPDATE CREDENTIAL MUTATIONS
  // --------------------------------------------------

  @Mutation(() => CredentialModel)
  async updateBearerCredential(
    @Args('input') input: UpdateBearerCredentialInput,
  ): Promise<CredentialModel> {
    return this.execute(() =>
      this.updateCredentialUseCase.execute({
        credentialId: input.credentialId,
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.BEARER,
          token: input.token,
        },
      }),
    );
  }

  @Mutation(() => CredentialModel)
  async updateBasicCredential(
    @Args('input') input: UpdateBasicCredentialInput,
  ): Promise<CredentialModel> {
    return this.execute(() =>
      this.updateCredentialUseCase.execute({
        credentialId: input.credentialId,
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.BASIC,
          username: input.username,
          password: input.password,
        },
      }),
    );
  }

  @Mutation(() => CredentialModel)
  async updateApiKeyCredential(
    @Args('input') input: UpdateApiKeyCredentialInput,
  ): Promise<CredentialModel> {
    return this.execute(() =>
      this.updateCredentialUseCase.execute({
        credentialId: input.credentialId,
        workspaceId: input.workspaceId,
        name: input.name,
        value: {
          type: CredentialType.API_KEY,
          value: input.value,
        },
      }),
    );
  }

  // --------------------------------------------------
  // GET CREDENTIAL BY ID QUERY
  // --------------------------------------------------

  @Query(() => CredentialModel, { name: 'credential' })
  async getCredential(
    @Args('id', { type: () => ID }) id: string,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<CredentialModel> {
    return this.execute(() =>
      this.getCredentialByIdUseCase.execute({
        credentialId: id,
        workspaceId,
      }),
    );
  }

  // --------------------------------------------------
  // GET CREDENTIALS BY WORKSPACE QUERY
  // --------------------------------------------------

  @Query(() => [CredentialModel], { name: 'credentialsByWorkspace' })
  async getCredentialsByWorkspace(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<CredentialModel[]> {
    return this.executeList(() =>
      this.getCredentialsByWorkspaceUseCase.execute(workspaceId),
    );
  }

  // --------------------------------------------------
  // RESPONSE MAPPING
  // --------------------------------------------------

  private toModel(credential: {
    id: string;
    workspaceId: string;
    name: string;
    type: CredentialType;
    createdAt: Date;
    updatedAt: Date;
  }): CredentialModel {
    return {
      id: credential.id,
      workspaceId: credential.workspaceId,
      name: credential.name,
      type: credential.type,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
    };
  }

  private async execute<T extends {
    id: string;
    workspaceId: string;
    name: string;
    type: CredentialType;
    createdAt: Date;
    updatedAt: Date;
  }>(operation: () => Promise<T>): Promise<CredentialModel> {
    try {
      const credential = await operation();
      return this.toModel(credential);
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  private async executeList<T extends {
    id: string;
    workspaceId: string;
    name: string;
    type: CredentialType;
    createdAt: Date;
    updatedAt: Date;
  }>(operation: () => Promise<T[]>): Promise<CredentialModel[]> {
    try {
      const credentials = await operation();
      return credentials.map((credential) => this.toModel(credential));
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  // --------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------

  private handleError(error: unknown): never {
    if (error instanceof DuplicateCredentialError) {
      throw new GraphQLError(error.message, {
        extensions: { code: 'CONFLICT' },
      });
    }

    if (
      error instanceof CredentialNotFoundError ||
      error instanceof WorkspaceNotFoundError
    ) {
      throw new GraphQLError(error.message, {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    if (error instanceof CredentialTypeMismatchError) {
      throw new GraphQLError(error.message, {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    if (error instanceof InvalidCredentialError) {
      throw new BadRequestException(error.message);
    }

    throw error;
  }
}
