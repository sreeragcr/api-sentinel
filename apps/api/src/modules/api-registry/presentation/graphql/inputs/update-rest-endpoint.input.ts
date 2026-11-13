
import { Field, ID, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

import { HttpMethod } from '../../../domain/enums/http-method.enum.js';

@InputType()
export class UpdateRestEndpointInput {
  @Field(() => ID)
  @IsUUID()
  id!: string;

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

  @Field(() => HttpMethod)
  @IsEnum(HttpMethod)
  method!: HttpMethod;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  path!: string;
}
