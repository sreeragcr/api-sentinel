

import { Project } from '../../domain/entities/project.entity.js';

export const PROJECT_REPOSITORY = Symbol(
  'PROJECT_REPOSITORY',
);

export interface ProjectRepository {
  save(project: Project): Promise<Project>;
}
