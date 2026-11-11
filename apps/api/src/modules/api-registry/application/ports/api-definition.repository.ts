
import { ApiDefinition } from '../../domain/entities/api-definition.entity.js';

export const API_DEFINITION_REPOSITORY = Symbol(
  'API_DEFINITION_REPOSITORY',
);

export interface ApiDefinitionRepository {
  save(apiDefinition: ApiDefinition): Promise<ApiDefinition>;

  findById(id: string): Promise<ApiDefinition | null>;

  findByProjectIdAndName(
    projectId: string,
    name: string,
  ): Promise<ApiDefinition | null>;
}