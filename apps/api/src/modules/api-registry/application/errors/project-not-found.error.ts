
export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project "${projectId}" does not exist`);
    this.name = 'ProjectNotFoundError';
  }
}