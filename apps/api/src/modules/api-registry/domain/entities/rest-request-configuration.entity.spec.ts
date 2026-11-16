
import { describe, expect, it } from 'vitest';

import { RestRequestConfiguration } from './rest-request-configuration.entity.js';

import { InvalidRestRequestConfigurationError } from '../errors/invalid-rest-request-configuration.error.js';

import { AuthenticationType } from '../enums/authentication-type.enum.js';
import { RequestBodyType } from '../enums/request-body-type.enum.js';

describe('RestRequestConfiguration', () => {
    describe('create()', () => {
        it('should create a request configuration successfully', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
            });

            expect(configuration).toBeInstanceOf(RestRequestConfiguration);
            expect(configuration.id).toBe('config-123');
            expect(configuration.endpointId).toBe('endpoint-123');
            expect(configuration.queryParameters).toEqual([]);
            expect(configuration.pathParameters).toEqual([]);
            expect(configuration.headers).toEqual([]);
            expect(configuration.authentication).toEqual({
                type: AuthenticationType.NONE,
            });
            expect(configuration.body).toEqual({
                type: RequestBodyType.NONE,
            });
            expect(configuration.createdAt).toBeInstanceOf(Date);
            expect(configuration.updatedAt).toBeInstanceOf(Date);
        });

        it('should reject an empty configuration ID', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: ' ',
                    endpointId: 'endpoint-123',
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should reject an empty endpoint ID', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: ' ',
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should create configuration with query parameters', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                queryParameters: [
                    { key: 'page', value: '1', enabled: true },
                    { key: 'limit', value: '10', enabled: true },
                ],
            });

            expect(configuration.queryParameters).toHaveLength(2);
            expect(configuration.queryParameters[0].key).toBe('page');
        });

        it('should create configuration with path parameters', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                pathParameters: [
                    { key: 'userId', value: '123', enabled: true },
                ],
            });

            expect(configuration.pathParameters).toHaveLength(1);
            expect(configuration.pathParameters[0].value).toBe('123');
        });

        it('should create configuration with headers', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/json',
                        enabled: true,
                    },
                ],
            });

            expect(configuration.headers).toHaveLength(1);
            expect(configuration.headers[0].key).toBe('Content-Type');
        });

        it('should trim parameter and header keys', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                queryParameters: [
                    { key: ' page ', value: '1', enabled: true },
                ],
                headers: [
                    {
                        key: ' Content-Type ',
                        value: 'application/json',
                        enabled: true,
                    },
                ],
            });

            expect(configuration.queryParameters[0].key).toBe('page');
            expect(configuration.headers[0].key).toBe('Content-Type');
        });

        it('should reject duplicate query parameter keys', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    queryParameters: [
                        { key: 'page', value: '1', enabled: true },
                        { key: 'page', value: '2', enabled: true },
                    ],
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should reject duplicate path parameter keys', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    pathParameters: [
                        { key: 'userId', value: '1', enabled: true },
                        { key: 'userId', value: '2', enabled: true },
                    ],
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should reject duplicate header keys case-insensitively', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    headers: [
                        {
                            key: 'Content-Type',
                            value: 'application/json',
                            enabled: true,
                        },
                        {
                            key: 'content-type',
                            value: 'text/plain',
                            enabled: true,
                        },
                    ],
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should reject empty parameter keys', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    queryParameters: [
                        { key: ' ', value: '1', enabled: true },
                    ],
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should reject empty header keys', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    headers: [
                        {
                            key: ' ',
                            value: 'application/json',
                            enabled: true,
                        },
                    ],
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should support Bearer authentication', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                authentication: {
                    type: AuthenticationType.BEARER,
                    credentialReference: 'secret-123',
                },
            });

            expect(configuration.authentication).toEqual({
                type: AuthenticationType.BEARER,
                credentialReference: 'secret-123',
            });
        });

        it('should support API Key authentication', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                authentication: {
                    type: AuthenticationType.API_KEY,
                    keyName: 'X-API-Key',
                    location: 'HEADER',
                    credentialReference: 'secret-123',
                },
            });

            expect(configuration.authentication.type).toBe(
                AuthenticationType.API_KEY,
            );
        });

        it('should support Basic authentication', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                authentication: {
                    type: AuthenticationType.BASIC,
                    credentialReference: 'secret-123',
                },
            });

            expect(configuration.authentication.type).toBe(
                AuthenticationType.BASIC,
            );
        });

        it('should reject an empty authentication credential reference', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    authentication: {
                        type: AuthenticationType.BEARER,
                        credentialReference: ' ',
                    },
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should reject an empty API key name', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    authentication: {
                        type: AuthenticationType.API_KEY,
                        keyName: ' ',
                        location: 'HEADER',
                        credentialReference: 'secret-123',
                    },
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should reject an invalid API key location', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    authentication: {
                        type: AuthenticationType.API_KEY,
                        keyName: 'X-API-Key',
                        location: 'COOKIE' as 'HEADER',
                        credentialReference: 'secret-123',
                    },
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should support a valid JSON request body', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                body: {
                    type: RequestBodyType.JSON,
                    content: '{"name":"John"}',
                },
            });

            expect(configuration.body).toEqual({
                type: RequestBodyType.JSON,
                content: '{"name":"John"}',
            });
        });

        it('should reject an invalid JSON request body', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    body: {
                        type: RequestBodyType.JSON,
                        content: '{invalid json}',
                    },
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it.each([
            RequestBodyType.FORM_URLENCODED,
            RequestBodyType.MULTIPART,
        ] as const)(
            'should support request body type %s',
            (type) => {
                const configuration = RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    body: {
                        type,
                        fields: [
                            { key: 'name', value: 'John', enabled: true },
                        ],
                    },
                });

                expect(configuration.body.type).toBe(type);
            },
        );

        it('should support a raw text request body', () => {
            const configuration = RestRequestConfiguration.create({
                id: 'config-123',
                endpointId: 'endpoint-123',
                body: {
                    type: RequestBodyType.RAW_TEXT,
                    content: 'Hello World',
                    contentType: 'text/plain',
                },
            });

            expect(configuration.body.type).toBe(RequestBodyType.RAW_TEXT);
        });

        it('should reject an empty raw text content type', () => {
            expect(() =>
                RestRequestConfiguration.create({
                    id: 'config-123',
                    endpointId: 'endpoint-123',
                    body: {
                        type: RequestBodyType.RAW_TEXT,
                        content: 'Hello',
                        contentType: ' ',
                    },
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });
    });

    describe('update()', () => {
        const createExistingConfiguration = () =>
            RestRequestConfiguration.reconstitute({
                id: 'config-123',
                endpointId: 'endpoint-123',
                queryParameters: [],
                pathParameters: [],
                headers: [],
                authentication: {
                    type: AuthenticationType.NONE,
                },
                body: {
                    type: RequestBodyType.NONE,
                },
                createdAt: new Date('2026-01-01T10:00:00.000Z'),
                updatedAt: new Date('2026-01-02T10:00:00.000Z'),
            });

        it('should update a request configuration successfully', () => {
            const configuration = createExistingConfiguration();

            const result = configuration.update({
                queryParameters: [
                    { key: 'page', value: '2', enabled: true },
                ],
                pathParameters: [],
                headers: [
                    {
                        key: 'Accept',
                        value: 'application/json',
                        enabled: true,
                    },
                ],
                authentication: {
                    type: AuthenticationType.BEARER,
                    credentialReference: 'secret-123',
                },
                body: {
                    type: RequestBodyType.NONE,
                },
            });

            expect(result.id).toBe(configuration.id);
            expect(result.endpointId).toBe(configuration.endpointId);
            expect(result.queryParameters).toHaveLength(1);
            expect(result.headers).toHaveLength(1);
            expect(result.authentication.type).toBe(AuthenticationType.BEARER);
        });

        it('should preserve identity and creation timestamp', () => {
            const configuration = createExistingConfiguration();

            const result = configuration.update({
                queryParameters: [],
                pathParameters: [],
                headers: [],
                authentication: {
                    type: AuthenticationType.NONE,
                },
                body: {
                    type: RequestBodyType.NONE,
                },
            });

            expect(result.id).toBe(configuration.id);
            expect(result.endpointId).toBe(configuration.endpointId);
            expect(result.createdAt).toBe(configuration.createdAt);
        });

        it('should update the updatedAt timestamp', () => {
            const configuration = createExistingConfiguration();

            const result = configuration.update({
                queryParameters: [],
                pathParameters: [],
                headers: [],
                authentication: {
                    type: AuthenticationType.NONE,
                },
                body: {
                    type: RequestBodyType.NONE,
                },
            });

            expect(result.updatedAt.getTime()).toBeGreaterThan(
                configuration.updatedAt.getTime(),
            );
        });

        it('should reject duplicate headers during update', () => {
            const configuration = createExistingConfiguration();

            expect(() =>
                configuration.update({
                    queryParameters: [],
                    pathParameters: [],
                    headers: [
                        {
                            key: 'Accept',
                            value: 'application/json',
                            enabled: true,
                        },
                        {
                            key: 'accept',
                            value: 'text/plain',
                            enabled: true,
                        },
                    ],
                    authentication: {
                        type: AuthenticationType.NONE,
                    },
                    body: {
                        type: RequestBodyType.NONE,
                    },
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });

        it('should reject invalid JSON during update', () => {
            const configuration = createExistingConfiguration();

            expect(() =>
                configuration.update({
                    queryParameters: [],
                    pathParameters: [],
                    headers: [],
                    authentication: {
                        type: AuthenticationType.NONE,
                    },
                    body: {
                        type: RequestBodyType.JSON,
                        content: '{invalid}',
                    },
                }),
            ).toThrow(InvalidRestRequestConfigurationError);
        });
    });

    describe('reconstitute()', () => {
        it('should reconstitute a request configuration from existing data', () => {
            const createdAt = new Date('2026-01-01T10:00:00.000Z');
            const updatedAt = new Date('2026-01-02T10:00:00.000Z');

            const configuration = RestRequestConfiguration.reconstitute({
                id: 'config-123',
                endpointId: 'endpoint-123',
                queryParameters: [
                    { key: 'page', value: '1', enabled: true },
                ],
                pathParameters: [],
                headers: [],
                authentication: {
                    type: AuthenticationType.NONE,
                },
                body: {
                    type: RequestBodyType.NONE,
                },
                createdAt,
                updatedAt,
            });

            expect(configuration).toBeInstanceOf(RestRequestConfiguration);
            expect(configuration.id).toBe('config-123');
            expect(configuration.endpointId).toBe('endpoint-123');
            expect(configuration.queryParameters).toHaveLength(1);
            expect(configuration.createdAt).toBe(createdAt);
            expect(configuration.updatedAt).toBe(updatedAt);
        });
    });
});
