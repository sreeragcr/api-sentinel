import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HealthModel {
  @Field()
  status!: string;

  @Field()
  service!: string;

  @Field()
  timestamp!: string;

  @Field(() => Int)
  uptimeSeconds!: number;
}