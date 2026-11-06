
export class WorkspaceNotFoundError extends Error {
  constructor(workspaceId: string) {
    super(`Workspace "${workspaceId}" does not exist`);
    this.name = 'WorkspaceNotFoundError';
  }
}
