import {
  Field,
  ID,
  InputType,
  Int,
} from '@nestjs/graphql';

import {
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';

@InputType()
export class GetApiDefinitionsByProjectInput {
  @Field(() => ID)
  @IsUUID()
  projectId!: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  offset = 0;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
