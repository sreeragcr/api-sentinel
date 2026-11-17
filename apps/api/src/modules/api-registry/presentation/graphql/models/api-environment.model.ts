import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApiEnvironmentModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  apiDefinitionId!: string;

  @Field()
  name!: string;

  @Field()
  baseUrl!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
