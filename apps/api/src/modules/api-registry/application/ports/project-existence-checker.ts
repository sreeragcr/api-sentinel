
export const PROJECT_EXISTENCE_CHECKER = Symbol(
  'PROJECT_EXISTENCE_CHECKER',
);

export interface ProjectExistenceChecker {
  existsById(projectId: string): Promise<boolean>;
}