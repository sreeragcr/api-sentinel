import { describe, expect, it } from 'vitest';

import { InvalidApiEnvironmentError } from '../errors/invalid-api-environment.error.js';
import { ApiEnvironment } from './api-environment.entity.js';

const validInput = () => ({
  id: 'environment-123',
  apiDefinitionId: 'api-definition-123',
  name: ' Development ',
  baseUrl: ' https://dev-api.example.com/ ',
  description: ' Development server ',
});

describe('ApiEnvironment', () => {

  it('accepts localhost as a development base URL', () => {
    const environment = ApiEnvironment.create({
      ...validInput(),
      baseUrl: 'http://localhost:3000',
    });

    expect(environment.baseUrl).toBe('http://localhost:3000');
  });

  it('creates a normalized environment', () => {
    const environment = ApiEnvironment.create(validInput());
    expect(environment.name).toBe('Development');
    expect(environment.baseUrl).toBe('https://dev-api.example.com');
    expect(environment.description).toBe('Development server');
  });

  it('rejects an empty environment name', () => {
    expect(() => ApiEnvironment.create({ ...validInput(), name: ' ' })).toThrow(
      InvalidApiEnvironmentError,
    );
  });

  it.each(['not-a-url', 'ftp://api.example.com', 'file:///tmp/api'])(
    'rejects invalid or unsupported base URL %s',
    (baseUrl) => {
      expect(() => ApiEnvironment.create({ ...validInput(), baseUrl })).toThrow(
        InvalidApiEnvironmentError,
      );
    },
  );

  it('updates mutable fields and preserves immutable properties', () => {
    const environment = ApiEnvironment.create(validInput());
    const updated = environment.update({
      name: 'Staging',
      baseUrl: 'https://staging.example.com/',
      description: 'Staging server',
    });
    expect(updated).toMatchObject({
      id: environment.id,
      apiDefinitionId: environment.apiDefinitionId,
      name: 'Staging',
      baseUrl: 'https://staging.example.com',
      createdAt: environment.createdAt,
    });
  });

  it('reconstitutes persisted state', () => {
    const createdAt = new Date('2026-01-01T00:00:00Z');
    const updatedAt = new Date('2026-01-02T00:00:00Z');
    const environment = ApiEnvironment.reconstitute({
      ...validInput(),
      name: 'Development',
      baseUrl: 'https://dev.example.com',
      description: null,
      createdAt,
      updatedAt,
    });
    expect(environment).toMatchObject({
      createdAt,
      updatedAt,
      description: null,
    });
  });
});
