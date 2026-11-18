import { CredentialType } from '../enums/credential-type.enum.js';

export type CredentialValue =
    | {
        type: CredentialType.BEARER;
        token: string;
    }
    | {
        type: CredentialType.BASIC;
        username: string;
        password: string;
    }
    | {
        type: CredentialType.API_KEY;
        value: string;
    };
