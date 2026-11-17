import { ApiEnvironment } from '../../domain/entities/api-environment.entity.js';

export const API_ENVIRONMENT_REPOSITORY = Symbol('API_ENVIRONMENT_REPOSITORY');

export interface ApiEnvironmentRepository {
  save(environment: ApiEnvironment): Promise<ApiEnvironment>;
  update(environment: ApiEnvironment): Promise<ApiEnvironment>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ApiEnvironment | null>;
  findByApiDefinitionIdAndName(
    apiDefinitionId: string,
    name: string,
  ): Promise<ApiEnvironment | null>;
  findByApiDefinitionId(apiDefinitionId: string): Promise<ApiEnvironment[]>;
}
