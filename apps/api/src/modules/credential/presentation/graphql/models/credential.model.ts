import {
  Field,
  GraphQLISODateTime,
  ID,
  ObjectType,
} from '@nestjs/graphql';

import { CredentialType } from '../../../domain/enums/credential-type.enum.js';

@ObjectType()
export class CredentialModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  workspaceId!: string;

  @Field()
  name!: string;

  @Field(() => CredentialType)
  type!: CredentialType;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
