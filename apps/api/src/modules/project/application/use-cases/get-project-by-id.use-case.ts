import { Project } from '../../domain/entities/project.entity.js';

import { ProjectRepository } from '../ports/project.repository.js';

import { ProjectNotFoundError } from '../errors/project-not-found.error.js';

export class GetProjectByIdUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(projectId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    return project;
  }
}