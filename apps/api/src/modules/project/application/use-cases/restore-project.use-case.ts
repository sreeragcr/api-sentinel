import { Project } from '../../domain/entities/project.entity.js';
import { ProjectRepository } from '../ports/project.repository.js';
import { ProjectNotFoundError } from '../errors/project-not-found.error.js';

interface RestoreProjectInput {
  projectId: string;
}

export class RestoreProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: RestoreProjectInput): Promise<Project> {
    const existingProject =
      await this.projectRepository.findById(input.projectId);

    if (!existingProject) {
      throw new ProjectNotFoundError(input.projectId);
    }

    // Already active: no database update required.
    if (existingProject.deletedAt === null) {
      return existingProject;
    }

    const restoredProject = existingProject.restore();

    return this.projectRepository.update(restoredProject);
  }
}