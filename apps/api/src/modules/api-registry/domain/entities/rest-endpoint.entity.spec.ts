
import { describe, expect, it } from 'vitest';

import {
  RestEndpoint,
  InvalidRestEndpointError,
} from './rest-endpoint.entity.js';

import { HttpMethod } from '../enums/http-method.enum.js';

describe('RestEndpoint', () => {
  describe('create()', () => {
    it('should create a REST endpoint successfully', () => {
      const endpoint = RestEndpoint.create({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get All Users',
        description: 'Retrieves all registered users',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(endpoint).toBeInstanceOf(RestEndpoint);
      expect(endpoint.id).toBe('endpoint-123');
      expect(endpoint.apiDefinitionId).toBe('api-definition-123');
      expect(endpoint.name).toBe('Get All Users');
      expect(endpoint.description).toBe(
        'Retrieves all registered users',
      );
      expect(endpoint.method).toBe(HttpMethod.GET);
      expect(endpoint.path).toBe('/users');
      expect(endpoint.createdAt).toBeInstanceOf(Date);
      expect(endpoint.updatedAt).toBeInstanceOf(Date);
    });

    it('should trim endpoint name', () => {
      const endpoint = RestEndpoint.create({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: '  Get All Users  ',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(endpoint.name).toBe('Get All Users');
    });

    it('should set description to null when not provided', () => {
      const endpoint = RestEndpoint.create({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get All Users',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(endpoint.description).toBeNull();
    });

    it('should trim endpoint description', () => {
      const endpoint = RestEndpoint.create({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get All Users',
        description: '  Retrieves users  ',
        method: HttpMethod.GET,
        path: '/users',
      });

      expect(endpoint.description).toBe('Retrieves users');
    });

    it.each(Object.values(HttpMethod))(
      'should support HTTP method %s',
      (method) => {
        const endpoint = RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: 'Test Endpoint',
          method,
          path: '/test',
        });

        expect(endpoint.method).toBe(method);
      },
    );

    it('should trim endpoint path', () => {
      const endpoint = RestEndpoint.create({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get User',
        method: HttpMethod.GET,
        path: '  /users/123  ',
      });

      expect(endpoint.path).toBe('/users/123');
    });

    it('should support dynamic path parameters', () => {
      const endpoint = RestEndpoint.create({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get User By ID',
        method: HttpMethod.GET,
        path: '/users/{id}',
      });

      expect(endpoint.path).toBe('/users/{id}');
    });

    it('should support nested endpoint paths', () => {
      const endpoint = RestEndpoint.create({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get User Orders',
        method: HttpMethod.GET,
        path: '/users/{id}/orders',
      });

      expect(endpoint.path).toBe('/users/{id}/orders');
    });

    it('should reject empty endpoint names', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: '   ',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject endpoint names longer than 120 characters', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: 'A'.repeat(121),
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject empty endpoint ID', () => {
      expect(() =>
        RestEndpoint.create({
          id: ' ',
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject empty API definition ID', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: ' ',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject unsupported HTTP methods', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: 'FETCH' as HttpMethod,
          path: '/users',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject empty endpoint paths', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '   ',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject paths that do not start with /', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: 'users',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject paths containing query parameters', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users?page=1',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject paths containing fragments', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          method: HttpMethod.GET,
          path: '/users#details',
        }),
      ).toThrow(InvalidRestEndpointError);
    });

    it('should reject descriptions longer than 500 characters', () => {
      expect(() =>
        RestEndpoint.create({
          id: 'endpoint-123',
          apiDefinitionId: 'api-definition-123',
          name: 'Get Users',
          description: 'A'.repeat(501),
          method: HttpMethod.GET,
          path: '/users',
        }),
      ).toThrow(InvalidRestEndpointError);
    });
  });

  describe('reconstitute()', () => {
    it('should reconstitute a REST endpoint from existing data', () => {
      const createdAt = new Date('2026-01-01T10:00:00.000Z');
      const updatedAt = new Date('2026-01-02T10:00:00.000Z');

      const endpoint = RestEndpoint.reconstitute({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get All Users',
        description: 'Retrieves users',
        method: HttpMethod.GET,
        path: '/users',
        createdAt,
        updatedAt,
      });

      expect(endpoint).toBeInstanceOf(RestEndpoint);
      expect(endpoint.id).toBe('endpoint-123');
      expect(endpoint.apiDefinitionId).toBe('api-definition-123');
      expect(endpoint.name).toBe('Get All Users');
      expect(endpoint.description).toBe('Retrieves users');
      expect(endpoint.method).toBe(HttpMethod.GET);
      expect(endpoint.path).toBe('/users');
      expect(endpoint.createdAt).toBe(createdAt);
      expect(endpoint.updatedAt).toBe(updatedAt);
    });

    it('should preserve null description when reconstituting', () => {
      const endpoint = RestEndpoint.reconstitute({
        id: 'endpoint-123',
        apiDefinitionId: 'api-definition-123',
        name: 'Get All Users',
        description: null,
        method: HttpMethod.GET,
        path: '/users',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(endpoint.description).toBeNull();
    });
  });
});
