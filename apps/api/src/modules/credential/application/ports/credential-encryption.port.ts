
export const CREDENTIAL_ENCRYPTION = Symbol('CREDENTIAL_ENCRYPTION');

export interface CredentialEncryptionPort {
  encrypt(plaintext: string): string;
  decrypt(encryptedValue: string): string;
}

