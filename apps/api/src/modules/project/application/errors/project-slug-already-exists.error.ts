
export class ProjectSlugAlreadyExistsError extends Error {
  constructor(
    workspaceId: string,
    slug: string,
  ) {
    super(
      `A project with slug "${slug}" already exists in workspace "${workspaceId}"`,
    );

    this.name = 'ProjectSlugAlreadyExistsError';
  }
}
