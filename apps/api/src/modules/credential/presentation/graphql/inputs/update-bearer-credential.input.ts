
import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class UpdateBearerCredentialInput {
  @Field(() => ID)
  @IsUUID()
  credentialId!: string;

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
  @MaxLength(10000)
  token!: string;
}
