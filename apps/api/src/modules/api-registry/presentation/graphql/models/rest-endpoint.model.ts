
import {
  Field,
  ID,
  ObjectType,
  GraphQLISODateTime,
  registerEnumType,
} from '@nestjs/graphql';

import { HttpMethod } from '../../../domain/enums/http-method.enum.js';

registerEnumType(HttpMethod, {
  name: 'HttpMethod',
  description: 'The HTTP method used by a REST endpoint',
});

@ObjectType()
export class RestEndpointModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  apiDefinitionId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => HttpMethod)
  method!: HttpMethod;

  @Field(() => String)
  path!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
