// Workspace repository port.

import { Workspace } from '../../domain/entities/workspace.entity.js';

export const WORKSPACE_REPOSITORY = Symbol(
  'WORKSPACE_REPOSITORY',
);

export interface WorkspaceRepository {
  save(workspace: Workspace): Promise<Workspace>;
}
