// Workspace GraphQL input.

import { Field, InputType } from '@nestjs/graphql';

import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateWorkspaceInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
