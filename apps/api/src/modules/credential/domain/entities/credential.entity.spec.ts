
import { describe, it, expect } from 'vitest';

import {
  Credential,
  InvalidCredentialError,
} from './credential.entity.js';

import { CredentialType } from '../enums/credential-type.enum.js';

describe('Credential', () => {
  const validProps = {
    id: 'credential-123',
    workspaceId: 'workspace-123',
    name: 'Payment API Token',
    type: CredentialType.BEARER,
    encryptedValue: 'encrypted-secret-value',
  };

  describe('create()', () => {
    it('should create a credential successfully', () => {
      const credential = Credential.create(validProps);

      expect(credential).toBeInstanceOf(Credential);
      expect(credential.id).toBe('credential-123');
      expect(credential.workspaceId).toBe('workspace-123');
      expect(credential.name).toBe('Payment API Token');
      expect(credential.type).toBe(CredentialType.BEARER);
      expect(credential.encryptedValue).toBe('encrypted-secret-value');
    });

    it('should trim whitespace from credential name', () => {
      const credential = Credential.create({
        ...validProps,
        name: '  Payment API Token  ',
      });

      expect(credential.name).toBe('Payment API Token');
    });

    it('should reject an empty credential ID', () => {
      expect(() =>
        Credential.create({
          ...validProps,
          id: '   ',
        }),
      ).toThrow(InvalidCredentialError);
    });

    it('should reject an empty workspace ID', () => {
      expect(() =>
        Credential.create({
          ...validProps,
          workspaceId: '   ',
        }),
      ).toThrow(InvalidCredentialError);
    });

    it('should reject an empty credential name', () => {
      expect(() =>
        Credential.create({
          ...validProps,
          name: '   ',
        }),
      ).toThrow(InvalidCredentialError);
    });

    it('should reject a credential name longer than 120 characters', () => {
      expect(() =>
        Credential.create({
          ...validProps,
          name: 'a'.repeat(121),
        }),
      ).toThrow(InvalidCredentialError);
    });

    it('should reject an invalid credential type', () => {
      expect(() =>
        Credential.create({
          ...validProps,
          type: 'INVALID' as CredentialType,
        }),
      ).toThrow(InvalidCredentialError);
    });

    it('should reject an empty encrypted value', () => {
      expect(() =>
        Credential.create({
          ...validProps,
          encryptedValue: '   ',
        }),
      ).toThrow(InvalidCredentialError);
    });

    it('should generate creation and update timestamps', () => {
      const credential = Credential.create(validProps);

      expect(credential.createdAt).toBeInstanceOf(Date);
      expect(credential.updatedAt).toBeInstanceOf(Date);
      expect(credential.createdAt.getTime()).toBe(
        credential.updatedAt.getTime(),
      );
    });
  });

  describe('update()', () => {
    it('should update credential name and encrypted value', () => {
      const credential = Credential.create(validProps);

      const updatedCredential = credential.update({
        name: 'Updated Payment Token',
        encryptedValue: 'new-encrypted-value',
      });

      expect(updatedCredential.name).toBe('Updated Payment Token');
      expect(updatedCredential.encryptedValue).toBe(
        'new-encrypted-value',
      );
    });

    it('should preserve ID, workspace ID, type and creation date', () => {
      const credential = Credential.create(validProps);

      const updatedCredential = credential.update({
        name: 'Updated Payment Token',
        encryptedValue: 'new-encrypted-value',
      });

      expect(updatedCredential.id).toBe(credential.id);
      expect(updatedCredential.workspaceId).toBe(
        credential.workspaceId,
      );
      expect(updatedCredential.type).toBe(credential.type);
      expect(updatedCredential.createdAt).toBe(credential.createdAt);
    });

    it('should reject an empty credential name', () => {
      const credential = Credential.create(validProps);

      expect(() =>
        credential.update({
          name: '   ',
          encryptedValue: 'new-encrypted-value',
        }),
      ).toThrow(InvalidCredentialError);
    });

    it('should reject an empty encrypted value', () => {
      const credential = Credential.create(validProps);

      expect(() =>
        credential.update({
          name: 'Updated Payment Token',
          encryptedValue: '   ',
        }),
      ).toThrow(InvalidCredentialError);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute a credential from stored data', () => {
      const props = {
        ...validProps,
        createdAt: new Date('2026-01-01T10:00:00Z'),
        updatedAt: new Date('2026-01-02T10:00:00Z'),
      };

      const credential = Credential.reconstitute(props);

      expect(credential).toBeInstanceOf(Credential);
      expect(credential.id).toBe(props.id);
      expect(credential.workspaceId).toBe(props.workspaceId);
      expect(credential.name).toBe(props.name);
      expect(credential.type).toBe(props.type);
      expect(credential.encryptedValue).toBe(props.encryptedValue);
      expect(credential.createdAt).toBe(props.createdAt);
      expect(credential.updatedAt).toBe(props.updatedAt);
    });
  });
});
