import { Field, ID, InputType } from '@nestjs/graphql';

import {
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class UpdateProjectInput {
  @Field(() => ID)
  @IsUUID()
  projectId!: string;

  @Field(() => String, { nullable: true })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @Field(() => String, { nullable: true })
  @ValidateIf(
    (_object, value) => value !== undefined && value !== null,
  )
  @IsString()
  @MaxLength(500)
  description?: string | null;
}