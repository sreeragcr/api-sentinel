
import { Project } from '../../domain/entities/project.entity.js';

import { InvalidProjectError } from '../../domain/entities/project.entity.js';

import { ProjectRepository } from '../ports/project.repository.js';

import { ProjectNotFoundError } from '../errors/project-not-found.error.js';

import { generateSlug } from '../../../../shared/domain/utils/slug.util.js';

interface UpdateProjectInput {
  projectId: string;
  name?: string;
  description?: string | null;
}

export class UpdateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(input: UpdateProjectInput): Promise<Project> {
    // Ensure at least one field is provided.
    if (
      input.name === undefined &&
      input.description === undefined
    ) {
      throw new InvalidProjectError(
        'At least one project field must be provided for update',
      );
    }

    // Retrieve the existing project.
    const existingProject =
      await this.projectRepository.findById(input.projectId);

    if (!existingProject) {
      throw new ProjectNotFoundError(input.projectId);
    }

    // Prepare the domain update properties.
    const updateProps: {
      name?: string;
      slug?: string;
      description?: string | null;
    } = {};

    // Generate a new slug only when the name changes.
    if (input.name !== undefined) {
      const slug = generateSlug(input.name);

      if (!slug) {
        throw new InvalidProjectError(
          'Project name must contain letters or numbers',
        );
      }

      updateProps.name = input.name;
      updateProps.slug = slug;
    }

    // Update description only when it is provided.
    if (input.description !== undefined) {
      updateProps.description = input.description;
    }

    // Apply domain validation.
    const updatedProject =
      existingProject.updateDetails(updateProps);

    // Persist the updated project.
    return this.projectRepository.update(updatedProject);
  }
}
