
import {
  Field,
  ID,
  ObjectType,
  GraphQLISODateTime,
} from '@nestjs/graphql';

import { AuthenticationType } from '../../../domain/enums/authentication-type.enum.js';
import { RequestBodyType } from '../../../domain/enums/request-body-type.enum.js';

import '../enums/graphql-enums.js';

@ObjectType()
export class QueryParameterModel {
  @Field()
  key!: string;

  @Field()
  value!: string;

  @Field()
  enabled!: boolean;
}

@ObjectType()
export class PathParameterModel {
  @Field()
  key!: string;

  @Field()
  value!: string;

  @Field()
  enabled!: boolean;
}

@ObjectType()
export class RequestHeaderModel {
  @Field()
  key!: string;

  @Field()
  value!: string;

  @Field()
  enabled!: boolean;
}

@ObjectType()
export class AuthenticationConfigModel {
  @Field(() => AuthenticationType)
  type!: AuthenticationType;

  @Field({ nullable: true })
  credentialReference?: string;

  @Field({ nullable: true })
  keyName?: string;

  @Field({ nullable: true })
  location?: string;
}

@ObjectType()
export class RequestBodyFieldModel {
  @Field()
  key!: string;

  @Field()
  value!: string;

  @Field()
  enabled!: boolean;
}

@ObjectType()
export class RequestBodyModel {
  @Field(() => RequestBodyType)
  type!: RequestBodyType;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  contentType?: string;

  @Field(() => [RequestBodyFieldModel], { nullable: true })
  fields?: RequestBodyFieldModel[];
}

@ObjectType()
export class RestRequestConfigurationModel {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  endpointId!: string;

  @Field(() => [QueryParameterModel])
  queryParameters!: QueryParameterModel[];

  @Field(() => [PathParameterModel])
  pathParameters!: PathParameterModel[];

  @Field(() => [RequestHeaderModel])
  headers!: RequestHeaderModel[];

  @Field(() => AuthenticationConfigModel)
  authentication!: AuthenticationConfigModel;

  @Field(() => RequestBodyModel)
  body!: RequestBodyModel;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
