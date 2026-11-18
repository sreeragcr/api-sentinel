
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CredentialEncryptionError,
  CredentialEncryptionService,
} from './credential-encryption.service.js';

describe('CredentialEncryptionService', () => {
  const validKey = 'a'.repeat(64);
  const originalKey = process.env.CREDENTIAL_ENCRYPTION_KEY;

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.CREDENTIAL_ENCRYPTION_KEY;
    } else {
      process.env.CREDENTIAL_ENCRYPTION_KEY = originalKey;
    }
    vi.restoreAllMocks();
  });

  const createService = (key = validKey) => {
    process.env.CREDENTIAL_ENCRYPTION_KEY = key;
    return new CredentialEncryptionService();
  };

  describe('constructor', () => {
    it('creates the service with a valid encryption key', () => {
      expect(() => createService()).not.toThrow();
    });

    it('rejects a missing encryption key', () => {
      delete process.env.CREDENTIAL_ENCRYPTION_KEY;

      expect(() => new CredentialEncryptionService()).toThrow(
        CredentialEncryptionError,
      );
    });

    it('rejects an invalid encryption key', () => {
      expect(() => createService('invalid-key')).toThrow(
        CredentialEncryptionError,
      );
    });
  });

  describe('encrypt', () => {
    it('encrypts plaintext into a versioned encrypted value', () => {
      const service = createService();

      const encrypted = service.encrypt('my-secret-token');

      expect(encrypted).toMatch(/^v1\..+\..+\..+$/);
      expect(encrypted).not.toContain('my-secret-token');
    });

    it('produces different encrypted values for the same plaintext', () => {
      const service = createService();

      const first = service.encrypt('my-secret-token');
      const second = service.encrypt('my-secret-token');

      expect(first).not.toBe(second);
    });
  });

  describe('decrypt', () => {
    it('decrypts an encrypted value to its original plaintext', () => {
      const service = createService();
      const plaintext = 'my-secret-token';

      const encrypted = service.encrypt(plaintext);

      expect(service.decrypt(encrypted)).toBe(plaintext);
    });

    it('rejects data encrypted with a different key', () => {
      const firstService = createService('a'.repeat(64));
      const encrypted = firstService.encrypt('my-secret-token');

      const secondService = createService('b'.repeat(64));

      expect(() => secondService.decrypt(encrypted)).toThrow(
        CredentialEncryptionError,
      );
    });

    it('rejects modified encrypted data', () => {
      const service = createService();
      const encrypted = service.encrypt('my-secret-token');

      const parts = encrypted.split('.');
      parts[3] = `${parts[3]}AA`;

      expect(() => service.decrypt(parts.join('.'))).toThrow(
        CredentialEncryptionError,
      );
    });

    it('rejects an invalid encrypted format', () => {
      const service = createService();

      expect(() => service.decrypt('invalid-data')).toThrow(
        CredentialEncryptionError,
      );
    });

    it('rejects an unsupported format version', () => {
      const service = createService();

      expect(() => service.decrypt('v2.a.b.c')).toThrow(
        CredentialEncryptionError,
      );
    });
  });
});
