import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiDefinition } from '../../domain/entities/api-definition.entity.js';
import { ApiEnvironment } from '../../domain/entities/api-environment.entity.js';
import { ApiProtocol } from '../../domain/enums/api-protocol.enum.js';
import { ApiDefinitionNotFoundError } from '../errors/api-definition-not-found.error.js';
import { ApiEnvironmentNotFoundError } from '../errors/api-environment-not-found.error.js';
import { DuplicateApiEnvironmentError } from '../errors/duplicate-api-environment.error.js';
import type { ApiDefinitionRepository } from '../ports/api-definition.repository.js';
import type { ApiEnvironmentRepository } from '../ports/api-environment.repository.js';
import { CreateApiEnvironmentUseCase } from './create-api-environment.use-case.js';
import { DeleteApiEnvironmentUseCase } from './delete-api-environment.use-case.js';
import { GetApiEnvironmentByIdUseCase } from './get-api-environment-by-id.use-case.js';
import { GetApiEnvironmentsByApiDefinitionUseCase } from './get-api-environments-by-api-definition.use-case.js';
import { UpdateApiEnvironmentUseCase } from './update-api-environment.use-case.js';

describe('API environment use cases', () => {
  const environment = () =>
    ApiEnvironment.create({
      id: 'environment-123',
      apiDefinitionId: 'api-definition-123',
      name: 'Development',
      baseUrl: 'https://dev.example.com',
    });
  const apiDefinition = ApiDefinition.create({
    id: 'api-definition-123',
    projectId: 'project-123',
    name: 'Users',
    protocol: ApiProtocol.REST,
  });
  const repository: ApiEnvironmentRepository = {
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByApiDefinitionIdAndName: vi.fn(),
    findByApiDefinitionId: vi.fn(),
  };
  const definitions: ApiDefinitionRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByProjectIdAndName: vi.fn(),
    findByProjectId: vi.fn(),
  };

  beforeEach(() => {
    Object.values(repository).forEach(
      (method) => typeof method === 'function' && vi.mocked(method).mockReset(),
    );
    vi.mocked(definitions.findById).mockReset();
    vi.mocked(definitions.findById).mockResolvedValue(apiDefinition);
    vi.mocked(repository.findByApiDefinitionIdAndName).mockResolvedValue(null);
    vi.mocked(repository.save).mockImplementation(async (value) => value);
    vi.mocked(repository.update).mockImplementation(async (value) => value);
  });

  it('creates an environment after verifying its API definition', async () => {
    const result = await new CreateApiEnvironmentUseCase(
      repository,
      definitions,
    ).execute({
      apiDefinitionId: apiDefinition.id,
      name: ' Development ',
      baseUrl: 'https://dev.example.com',
    });
    expect(result.name).toBe('Development');
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('rejects creation for a missing API definition or duplicate name', async () => {
    vi.mocked(definitions.findById).mockResolvedValueOnce(null);
    await expect(
      new CreateApiEnvironmentUseCase(repository, definitions).execute({
        apiDefinitionId: 'missing',
        name: 'Dev',
        baseUrl: 'https://dev.example.com',
      }),
    ).rejects.toBeInstanceOf(ApiDefinitionNotFoundError);
    vi.mocked(repository.findByApiDefinitionIdAndName).mockResolvedValue(
      environment(),
    );
    await expect(
      new CreateApiEnvironmentUseCase(repository, definitions).execute({
        apiDefinitionId: apiDefinition.id,
        name: 'Development',
        baseUrl: 'https://dev.example.com',
      }),
    ).rejects.toBeInstanceOf(DuplicateApiEnvironmentError);
  });

  it('retrieves and deletes environments, reporting missing IDs', async () => {
    vi.mocked(repository.findById).mockResolvedValue(environment());
    await expect(
      new GetApiEnvironmentByIdUseCase(repository).execute('environment-123'),
    ).resolves.toMatchObject({ id: 'environment-123' });
    await expect(
      new DeleteApiEnvironmentUseCase(repository).execute('environment-123'),
    ).resolves.toBeUndefined();
    vi.mocked(repository.findById).mockResolvedValue(null);
    await expect(
      new GetApiEnvironmentByIdUseCase(repository).execute('missing'),
    ).rejects.toBeInstanceOf(ApiEnvironmentNotFoundError);
  });

  it('lists environments only for an existing API definition', async () => {
    vi.mocked(repository.findByApiDefinitionId).mockResolvedValue([
      environment(),
    ]);
    await expect(
      new GetApiEnvironmentsByApiDefinitionUseCase(
        repository,
        definitions,
      ).execute(apiDefinition.id),
    ).resolves.toHaveLength(1);
  });

  it('updates only an existing environment and prevents duplicate names', async () => {
    vi.mocked(repository.findById).mockResolvedValue(environment());
    const updated = await new UpdateApiEnvironmentUseCase(repository).execute({
      id: 'environment-123',
      name: 'Staging',
      baseUrl: 'https://staging.example.com',
    });
    expect(updated.baseUrl).toBe('https://staging.example.com');
    vi.mocked(repository.findByApiDefinitionIdAndName).mockResolvedValue(
      ApiEnvironment.create({
        id: 'other',
        apiDefinitionId: 'api-definition-123',
        name: 'Production',
        baseUrl: 'https://api.example.com',
      }),
    );
    await expect(
      new UpdateApiEnvironmentUseCase(repository).execute({
        id: 'environment-123',
        name: 'Production',
        baseUrl: 'https://api.example.com',
      }),
    ).rejects.toBeInstanceOf(DuplicateApiEnvironmentError);
  });
});
