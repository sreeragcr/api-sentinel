// Workspace creation use case.

import { randomUUID } from 'node:crypto';

import {
  Workspace,
  InvalidWorkspaceError,
} from '../../domain/entities/workspace.entity.js';

import { WorkspaceRepository } from '../ports/workspace.repository.js';

interface CreateWorkspaceInput {
  name: string;
  description?: string;
}

export class CreateWorkspaceUseCase {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute(input: CreateWorkspaceInput): Promise<Workspace> {
    const name = input.name.trim();

    const slug = name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
      .replace(/-+$/g, '');

    if (!slug) {
      throw new InvalidWorkspaceError(
        'Workspace name must contain letters or numbers',
      );
    }

    const workspace = Workspace.create({
      id: randomUUID(),
      name,
      slug,
      description: input.description ?? null,
    });

    return this.workspaceRepository.save(workspace);
  }
}
