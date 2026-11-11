import { ProjectRepository } from '../ports/project.repository.js';

import { ProjectNotFoundError } from '../errors/project-not-found.error.js';

import { ProjectNotInTrashError } from '../errors/project-not-in-trash.error.js';

interface PermanentlyDeleteProjectInput {
  projectId: string;
}

export class PermanentlyDeleteProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: PermanentlyDeleteProjectInput): Promise<void> {
    const existingProject =
      await this.projectRepository.findById(input.projectId);

    if (!existingProject) {
      throw new ProjectNotFoundError(input.projectId);
    }

    if (existingProject.deletedAt === null) {
      throw new ProjectNotInTrashError(input.projectId);
    }

    await this.projectRepository.deleteById(input.projectId);
  }
}