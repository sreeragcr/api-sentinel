

export const WORKSPACE_EXISTENCE_CHECKER = Symbol(
  'WORKSPACE_EXISTENCE_CHECKER',
);

export interface WorkspaceExistenceChecker {
  existsById(workspaceId: string): Promise<boolean>;
}
