
import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const FORMAT_VERSION = 'v1';
const ADDITIONAL_AUTHENTICATED_DATA = Buffer.from(
  'api-sentinel:credential:v1',
);

export class CredentialEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CredentialEncryptionError';
  }
}

@Injectable()
export class CredentialEncryptionService {
  private readonly key: Buffer;

  constructor() {
    const encryptionKey = process.env.CREDENTIAL_ENCRYPTION_KEY;

    if (!encryptionKey || !/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
      throw new CredentialEncryptionError(
        'CREDENTIAL_ENCRYPTION_KEY must be a valid 32-byte hexadecimal key',
      );
    }

    this.key = Buffer.from(encryptionKey, 'hex');

    if (this.key.length !== KEY_LENGTH) {
      throw new CredentialEncryptionError(
        'Invalid credential encryption key length',
      );
    }
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    cipher.setAAD(ADDITIONAL_AUTHENTICATED_DATA);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      FORMAT_VERSION,
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join('.');
  }

  decrypt(encryptedValue: string): string {
    const parts = encryptedValue.split('.');

    if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
      throw new CredentialEncryptionError(
        'Invalid encrypted credential format',
      );
    }

    const [, encodedIv, encodedAuthTag, encodedCiphertext] = parts;

    try {
      const iv = Buffer.from(encodedIv, 'base64url');
      const authTag = Buffer.from(encodedAuthTag, 'base64url');
      const ciphertext = Buffer.from(encodedCiphertext, 'base64url');

      if (
        iv.length !== IV_LENGTH ||
        authTag.length !== AUTH_TAG_LENGTH
      ) {
        throw new CredentialEncryptionError(
          'Invalid encrypted credential data',
        );
      }

      const decipher = createDecipheriv(ALGORITHM, this.key, iv);

      decipher.setAAD(ADDITIONAL_AUTHENTICATED_DATA);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      throw new CredentialEncryptionError(
        'Unable to decrypt credential',
      );
    }
  }
}

