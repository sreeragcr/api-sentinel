
import { randomUUID } from 'node:crypto';

import {
  Project,
  InvalidProjectError,
} from '../../domain/entities/project.entity.js';

import { ProjectRepository } from '../ports/project.repository.js';

import {
  WorkspaceExistenceChecker,
} from '../ports/workspace-existence-checker.js';

import {
  WorkspaceNotFoundError,
} from '../errors/workspace-not-found.error.js';

import { generateSlug } from '../../../../shared/domain/utils/slug.util.js';

interface CreateProjectInput {
  workspaceId: string;
  name: string;
  description?: string;
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceExistenceChecker: WorkspaceExistenceChecker,
  ) {}

  async execute(input: CreateProjectInput): Promise<Project> {
    const slug = generateSlug(input.name);

    if (!slug) {
      throw new InvalidProjectError(
        'Project name must contain letters or numbers',
      );
    }

    const project = Project.create({
      id: randomUUID(),
      workspaceId: input.workspaceId,
      name: input.name,
      slug,
      description: input.description,
    });

    const workspaceExists =
      await this.workspaceExistenceChecker.existsById(
        project.workspaceId,
      );

    if (!workspaceExists) {
      throw new WorkspaceNotFoundError(project.workspaceId);
    }

    return this.projectRepository.save(project);
  }
}
