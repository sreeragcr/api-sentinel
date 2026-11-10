
import { Project } from '../../domain/entities/project.entity.js';

import { ProjectRepository } from '../ports/project.repository.js';

import { ProjectNotFoundError } from '../errors/project-not-found.error.js';

interface DeleteProjectInput {
  projectId: string;
}

export class DeleteProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: DeleteProjectInput): Promise<Project> {
    // Retrieve the existing project.
    const existingProject =
      await this.projectRepository.findById(input.projectId);

    if (!existingProject) {
      throw new ProjectNotFoundError(input.projectId);
    }

    // Avoid updating a project that is already deleted.
    if (existingProject.deletedAt !== null) {
      return existingProject;
    }

    // Apply the domain soft-delete operation.
    const deletedProject = existingProject.softDelete();

    // Persist the updated project.
    return this.projectRepository.update(deletedProject);
  }
}
