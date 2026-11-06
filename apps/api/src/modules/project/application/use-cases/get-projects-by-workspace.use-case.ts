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

interface GetProjectsByWorkspaceInput {
  workspaceId: string;
  offset: number;
  limit: number;
}

export class GetProjectsByWorkspaceUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceExistenceChecker: WorkspaceExistenceChecker,
  ) {}

  async execute(
    input: GetProjectsByWorkspaceInput,
  ): Promise<ProjectListResult> {
    const workspaceExists =
      await this.workspaceExistenceChecker.existsById(
        input.workspaceId,
      );

    if (!workspaceExists) {
      throw new WorkspaceNotFoundError(input.workspaceId);
    }

    return this.projectRepository.findByWorkspaceId(
      input.workspaceId,
      {
        offset: input.offset,
        limit: input.limit,
      },
    );
  }
}