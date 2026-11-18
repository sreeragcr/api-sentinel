import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateBasicCredentialInput {
  @Field(() => ID)
  @IsUUID()
  workspaceId!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  username!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  password!: string;
}