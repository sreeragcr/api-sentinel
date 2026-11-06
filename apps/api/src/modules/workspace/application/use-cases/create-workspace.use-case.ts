
import { randomUUID } from 'node:crypto';

import {
  Workspace,
  InvalidWorkspaceError,
} from '../../domain/entities/workspace.entity.js';

import { WorkspaceRepository } from '../ports/workspace.repository.js';

import { generateSlug } from '../../../../shared/domain/utils/slug.util.js';

interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export class CreateWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute(input: CreateWorkspaceInput): Promise<Workspace> {
    const slug = generateSlug(input.name);

    if (!slug) {
      throw new InvalidWorkspaceError(
        'Workspace name must contain letters or numbers',
      );
    }

    const workspace = Workspace.create({
      id: randomUUID(),
      name: input.name,
      slug,
      description: input.description,
    });

    return this.workspaceRepository.save(workspace);
  }
}
