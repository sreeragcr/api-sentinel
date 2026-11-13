
import {
  Field,
  ID,
  InputType,
  Int,
} from '@nestjs/graphql';

import {
  IsInt,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

@InputType()
export class GetRestEndpointsByApiDefinitionInput {
  @Field(() => ID)
  @IsUUID()
  apiDefinitionId!: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(0)
  offset: number = 0;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
