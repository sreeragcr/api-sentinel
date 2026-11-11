export class ProjectNotInTrashError extends Error {
  constructor(projectId: string) {
    super(`Project with ID ${projectId} is not in trash`);
    this.name = 'ProjectNotInTrashError';
  }
}