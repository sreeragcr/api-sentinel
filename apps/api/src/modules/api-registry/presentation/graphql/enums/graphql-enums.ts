import { registerEnumType } from '@nestjs/graphql';

import { AuthenticationType } from '../../../domain/enums/authentication-type.enum.js';
import { RequestBodyType } from '../../../domain/enums/request-body-type.enum.js';

registerEnumType(AuthenticationType, {
  name: 'AuthenticationType',
  description: 'Authentication method for a REST request',
});

registerEnumType(RequestBodyType, {
  name: 'RequestBodyType',
  description: 'Body format for a REST request',
});