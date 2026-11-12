
import {
  ApiDefinitionRepository,
  ApiDefinitionListResult,
} from '../ports/api-definition.repository.js';

import {
  ProjectExistenceChecker,
} from '../ports/project-existence-checker.js';

import {
  ProjectNotFoundError,
} from '../errors/project-not-found.error.js';

interface GetApiDefinitionsByProjectInput {
  projectId: string;
  offset: number;
  limit: number;
}

export class GetApiDefinitionsByProjectUseCase {
  constructor(
    private readonly apiDefinitionRepository: ApiDefinitionRepository,
    private readonly projectExistenceChecker: ProjectExistenceChecker,
  ) {}

  async execute(
    input: GetApiDefinitionsByProjectInput,
  ): Promise<ApiDefinitionListResult> {
    const projectExists =
      await this.projectExistenceChecker.existsById(
        input.projectId,
      );

    if (!projectExists) {
      throw new ProjectNotFoundError(input.projectId);
    }

    return this.apiDefinitionRepository.findByProjectId(
      input.projectId,
      {
        offset: input.offset,
        limit: input.limit,
      },
    );
  }
}
