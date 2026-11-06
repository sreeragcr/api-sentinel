
import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ProjectModel } from './project.model.js';

@ObjectType()
export class ProjectListModel {
  @Field(() => [ProjectModel])
  items!: ProjectModel[];

  @Field(() => Int)
  totalCount!: number;
}
