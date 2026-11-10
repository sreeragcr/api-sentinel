
import { Project } from '../../domain/entities/project.entity.js';

export const PROJECT_REPOSITORY = Symbol(
  'PROJECT_REPOSITORY',
);

export interface ProjectListOptions {
  offset: number;
  limit: number;
}

export interface ProjectListResult {
  items: Project[];
  totalCount: number;
}

export interface ProjectRepository {
  save(project: Project): Promise<Project>;

  update(project: Project): Promise<Project>;

  findById(id: string): Promise<Project | null>;

  // Retrieves active projects belonging to a workspace.
  findByWorkspaceId(
    workspaceId: string,
    options: ProjectListOptions,
  ): Promise<ProjectListResult>;

  // Retrieves deleted projects belonging to a workspace.
  findDeletedByWorkspaceId(
    workspaceId: string,
    options: ProjectListOptions,
  ): Promise<ProjectListResult>;

  // Permanently removes a project.
  deleteById(id: string): Promise<void>;
}
