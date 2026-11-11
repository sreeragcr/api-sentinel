
import {
  ProjectRepository,
  ProjectListResult,
} from '../ports/project.repository.js';

import {
  WorkspaceExistenceChecker,
} from '../ports/workspace-existence-checker.js';

import {
  WorkspaceNotFoundError,
} from '../errors/workspace-not-found.error.js';

interface GetDeletedProjectsByWorkspaceInput {
  workspaceId: string;
  offset: number;
  limit: number;
}

export class GetDeletedProjectsByWorkspaceUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceExistenceChecker: WorkspaceExistenceChecker,
  ) {}

  async execute(
    input: GetDeletedProjectsByWorkspaceInput,
  ): Promise<ProjectListResult> {
    const workspaceExists =
      await this.workspaceExistenceChecker.existsById(
        input.workspaceId,
      );

    if (!workspaceExists) {
      throw new WorkspaceNotFoundError(input.workspaceId);
    }

    return this.projectRepository.findDeletedByWorkspaceId(
      input.workspaceId,
      {
        offset: input.offset,
        limit: input.limit,
      },
    );
  }
}
