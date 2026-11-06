
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

  findById(id: string): Promise<Project | null>;

  findByWorkspaceId(
    workspaceId: string,
    options: ProjectListOptions,
  ): Promise<ProjectListResult>;
}
