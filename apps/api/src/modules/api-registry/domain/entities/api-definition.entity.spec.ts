import { describe, expect, it } from 'vitest';

import {
  ApiDefinition,
  InvalidApiDefinitionError,
} from './api-definition.entity.js';

import { ApiProtocol } from '../enums/api-protocol.enum.js';

describe('ApiDefinition', () => {
  const validProps = {
    id: 'api-123',
    projectId: 'project-123',
    name: 'Payment API',
    description: 'Handles payment operations',
    protocol: ApiProtocol.REST,
  };

  describe('create()', () => {
    it('should create an API definition successfully', () => {
      const api = ApiDefinition.create(validProps);

      expect(api).toBeInstanceOf(ApiDefinition);
      expect(api.id).toBe('api-123');
      expect(api.projectId).toBe('project-123');
      expect(api.name).toBe('Payment API');
      expect(api.description).toBe(
        'Handles payment operations',
      );
      expect(api.protocol).toBe(ApiProtocol.REST);
    });

    it('should trim whitespace from API name', () => {
      const api = ApiDefinition.create({
        ...validProps,
        name: '  Payment API  ',
      });

      expect(api.name).toBe('Payment API');
    });

    it('should normalize empty description to null', () => {
      const api = ApiDefinition.create({
        ...validProps,
        description: '   ',
      });

      expect(api.description).toBeNull();
    });

    it('should use null when description is not provided', () => {
      const api = ApiDefinition.create({
        ...validProps,
        description: undefined,
      });

      expect(api.description).toBeNull();
    });

    it('should support REST protocol', () => {
      const api = ApiDefinition.create({
        ...validProps,
        protocol: ApiProtocol.REST,
      });

      expect(api.protocol).toBe(ApiProtocol.REST);
    });

    it('should support GraphQL protocol', () => {
      const api = ApiDefinition.create({
        ...validProps,
        protocol: ApiProtocol.GRAPHQL,
      });

      expect(api.protocol).toBe(ApiProtocol.GRAPHQL);
    });

    it('should support gRPC protocol', () => {
      const api = ApiDefinition.create({
        ...validProps,
        protocol: ApiProtocol.GRPC,
      });

      expect(api.protocol).toBe(ApiProtocol.GRPC);
    });

    it('should reject an empty API name', () => {
      expect(() =>
        ApiDefinition.create({
          ...validProps,
          name: '   ',
        }),
      ).toThrow(InvalidApiDefinitionError);
    });

    it('should reject an API name longer than 120 characters', () => {
      expect(() =>
        ApiDefinition.create({
          ...validProps,
          name: 'a'.repeat(121),
        }),
      ).toThrow(InvalidApiDefinitionError);
    });

    it('should reject an empty API ID', () => {
      expect(() =>
        ApiDefinition.create({
          ...validProps,
          id: ' ',
        }),
      ).toThrow(InvalidApiDefinitionError);
    });

    it('should reject an empty project ID', () => {
      expect(() =>
        ApiDefinition.create({
          ...validProps,
          projectId: ' ',
        }),
      ).toThrow(InvalidApiDefinitionError);
    });

    it('should reject an invalid protocol', () => {
      expect(() =>
        ApiDefinition.create({
          ...validProps,
          protocol: 'SOAP' as ApiProtocol,
        }),
      ).toThrow(InvalidApiDefinitionError);
    });

    it('should reject a description longer than 500 characters', () => {
      expect(() =>
        ApiDefinition.create({
          ...validProps,
          description: 'a'.repeat(501),
        }),
      ).toThrow(InvalidApiDefinitionError);
    });

    it('should generate creation and update timestamps', () => {
      const api = ApiDefinition.create(validProps);

      expect(api.createdAt).toBeInstanceOf(Date);
      expect(api.updatedAt).toBeInstanceOf(Date);

      expect(api.createdAt.getTime()).toBe(
        api.updatedAt.getTime(),
      );
    });
  });

  describe('reconstitute()', () => {
    it('should reconstruct an API definition without changing timestamps', () => {
      const createdAt = new Date('2026-01-01T10:00:00Z');
      const updatedAt = new Date('2026-02-01T10:00:00Z');

      const api = ApiDefinition.reconstitute({
        ...validProps,
        description: validProps.description,
        createdAt,
        updatedAt,
      });

      expect(api).toBeInstanceOf(ApiDefinition);
      expect(api.createdAt).toBe(createdAt);
      expect(api.updatedAt).toBe(updatedAt);
      expect(api.protocol).toBe(ApiProtocol.REST);
    });
  });
});
