
import {
  Field,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import {
  RestEndpointModel,
} from './rest-endpoint.model.js';

@ObjectType()
export class RestEndpointListModel {
  @Field(() => [RestEndpointModel])
  items!: RestEndpointModel[];

  @Field(() => Int)
  totalCount!: number;
}
