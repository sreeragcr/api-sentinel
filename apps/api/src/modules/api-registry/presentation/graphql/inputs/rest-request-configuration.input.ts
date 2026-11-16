
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import {
  Field,
  ID,
  InputType,
} from '@nestjs/graphql';

import { AuthenticationType } from '../../../domain/enums/authentication-type.enum.js';
import { RequestBodyType } from '../../../domain/enums/request-body-type.enum.js';

import '../enums/graphql-enums.js';

@InputType()
export class QueryParameterInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  key!: string;

  @Field()
  @IsString()
  value!: string;

  @Field()
  @IsBoolean()
  enabled!: boolean;
}

@InputType()
export class PathParameterInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  key!: string;

  @Field()
  @IsString()
  value!: string;

  @Field()
  @IsBoolean()
  enabled!: boolean;
}

@InputType()
export class RequestHeaderInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  key!: string;

  @Field()
  @IsString()
  value!: string;

  @Field()
  @IsBoolean()
  enabled!: boolean;
}

@InputType()
export class AuthenticationConfigInput {
  @Field(() => AuthenticationType)
  @IsEnum(AuthenticationType)
  type!: AuthenticationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  credentialReference?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  keyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(['HEADER', 'QUERY'])
  location?: 'HEADER' | 'QUERY';
}

@InputType()
export class RequestBodyFieldInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  key!: string;

  @Field()
  @IsString()
  value!: string;

  @Field()
  @IsBoolean()
  enabled!: boolean;
}

@InputType()
export class RequestBodyInput {
  @Field(() => RequestBodyType)
  @IsEnum(RequestBodyType)
  type!: RequestBodyType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contentType?: string;

  @Field(() => [RequestBodyFieldInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => RequestBodyFieldInput)
  fields?: RequestBodyFieldInput[];
}

@InputType()
export class CreateRestRequestConfigurationInput {
  @Field(() => ID)
  @IsUUID()
  endpointId!: string;

  @Field(() => [QueryParameterInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => QueryParameterInput)
  queryParameters?: QueryParameterInput[];

  @Field(() => [PathParameterInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => PathParameterInput)
  pathParameters?: PathParameterInput[];

  @Field(() => [RequestHeaderInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => RequestHeaderInput)
  headers?: RequestHeaderInput[];

  @Field(() => AuthenticationConfigInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuthenticationConfigInput)
  authentication?: AuthenticationConfigInput;

  @Field(() => RequestBodyInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => RequestBodyInput)
  body?: RequestBodyInput;
}
