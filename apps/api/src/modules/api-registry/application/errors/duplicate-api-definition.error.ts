
export class DuplicateApiDefinitionError extends Error {
  constructor(projectId: string, name: string) {
    super(
      `An API definition named "${name}" already exists in project "${projectId}"`,
    );
    this.name = 'DuplicateApiDefinitionError';
  }
}