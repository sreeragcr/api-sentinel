
import {
  Field,
  ID,
  ObjectType,
  GraphQLISODateTime,
  registerEnumType,
} from '@nestjs/graphql';

import { ApiProtocol } from '../../../domain/api-protocol.enum.js';

registerEnumType(ApiProtocol, {
  name: 'ApiProtocol',
  description: 'The protocol used by the registered API',
});

@ObjectType()
export class ApiDefinitionModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => ApiProtocol)
  protocol!: ApiProtocol;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
