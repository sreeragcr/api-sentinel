
import { Field, ID, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProtocol } from '../../../domain/api-protocol.enum.js';

@InputType()
export class CreateApiDefinitionInput {
  @Field(() => ID)
  @IsUUID()
  projectId!: string;

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

  @Field(() => ApiProtocol)
  @IsEnum(ApiProtocol)
  protocol!: ApiProtocol;
}
