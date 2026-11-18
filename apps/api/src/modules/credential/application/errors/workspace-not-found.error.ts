export class WorkspaceNotFoundError extends Error {
  constructor(public readonly workspaceId: string) {
    super(`Workspace "${workspaceId}" was not found`);
    this.name = 'WorkspaceNotFoundError';
  }
}