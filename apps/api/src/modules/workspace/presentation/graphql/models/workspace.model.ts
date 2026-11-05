
import {
  Field,
  ID,
  ObjectType,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@ObjectType()
export class WorkspaceModel {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
