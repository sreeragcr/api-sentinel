// Workspace application error.

export class WorkspaceSlugAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`A workspace with slug "${slug}" already exists`);
    this.name = 'WorkspaceSlugAlreadyExistsError';
  }
}
