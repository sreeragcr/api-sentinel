import { registerEnumType } from '@nestjs/graphql';
import { CredentialType } from '../../../domain/enums/credential-type.enum.js';

registerEnumType(CredentialType, {
  name: 'CredentialType',
  description: 'Type of credential used for API authentication',
});
