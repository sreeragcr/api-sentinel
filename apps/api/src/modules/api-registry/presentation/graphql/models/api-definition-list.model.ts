
import {
  Field,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { ApiDefinitionModel } from './api-definition.model.js';

@ObjectType()
export class ApiDefinitionListModel {
  @Field(() => [ApiDefinitionModel])
  items!: ApiDefinitionModel[];

  @Field(() => Int)
  totalCount!: number;
}
