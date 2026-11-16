
import { AuthenticationType } from '../enums/authentication-type.enum.js';
import { RequestBodyType } from '../enums/request-body-type.enum.js';
import { InvalidRestRequestConfigurationError } from '../errors/invalid-rest-request-configuration.error.js';

export interface QueryParameter {
  key: string;
  value: string;
  enabled: boolean;
}

export interface PathParameter {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export type ApiKeyLocation = 'HEADER' | 'QUERY';

export type AuthenticationConfig =
  | {
      type: AuthenticationType.NONE;
    }
  | {
      type: AuthenticationType.BEARER;
      credentialReference: string;
    }
  | {
      type: AuthenticationType.API_KEY;
      keyName: string;
      location: ApiKeyLocation;
      credentialReference: string;
    }
  | {
      type: AuthenticationType.BASIC;
      credentialReference: string;
    };

export interface RequestBodyField {
  key: string;
  value: string;
  enabled: boolean;
}

export type RequestBody =
  | {
      type: RequestBodyType.NONE;
    }
  | {
      type: RequestBodyType.JSON;
      content: string;
    }
  | {
      type: RequestBodyType.FORM_URLENCODED;
      fields: RequestBodyField[];
    }
  | {
      type: RequestBodyType.MULTIPART;
      fields: RequestBodyField[];
    }
  | {
      type: RequestBodyType.RAW_TEXT;
      content: string;
      contentType?: string;
    };

export interface RestRequestConfigurationProps {
  id: string;
  endpointId: string;
  queryParameters: QueryParameter[];
  pathParameters: PathParameter[];
  headers: RequestHeader[];
  authentication: AuthenticationConfig;
  body: RequestBody;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateRestRequestConfigurationProps {
  id: string;
  endpointId: string;
  queryParameters?: QueryParameter[];
  pathParameters?: PathParameter[];
  headers?: RequestHeader[];
  authentication?: AuthenticationConfig;
  body?: RequestBody;
}

interface UpdateRestRequestConfigurationProps {
  queryParameters: QueryParameter[];
  pathParameters: PathParameter[];
  headers: RequestHeader[];
  authentication: AuthenticationConfig;
  body: RequestBody;
}

export class RestRequestConfiguration {
  private constructor(
    public readonly id: string,
    public readonly endpointId: string,
    public readonly queryParameters: QueryParameter[],
    public readonly pathParameters: PathParameter[],
    public readonly headers: RequestHeader[],
    public readonly authentication: AuthenticationConfig,
    public readonly body: RequestBody,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    props: CreateRestRequestConfigurationProps,
  ): RestRequestConfiguration {
    if (!props.id.trim()) {
      throw new InvalidRestRequestConfigurationError(
        'Invalid request configuration ID',
      );
    }

    if (!props.endpointId.trim()) {
      throw new InvalidRestRequestConfigurationError(
        'Invalid REST endpoint ID',
      );
    }

    const queryParameters = this.validateParameters(
      props.queryParameters ?? [],
      'query parameter',
    );

    const pathParameters = this.validateParameters(
      props.pathParameters ?? [],
      'path parameter',
    );

    const headers = this.validateHeaders(props.headers ?? []);

    const authentication = this.validateAuthentication(
      props.authentication ?? { type: AuthenticationType.NONE },
    );

    const body = this.validateBody(
      props.body ?? { type: RequestBodyType.NONE },
    );

    const now = new Date();

    return new RestRequestConfiguration(
      props.id,
      props.endpointId,
      queryParameters,
      pathParameters,
      headers,
      authentication,
      body,
      now,
      now,
    );
  }

  update(
    props: UpdateRestRequestConfigurationProps,
  ): RestRequestConfiguration {
    const queryParameters = RestRequestConfiguration.validateParameters(
      props.queryParameters,
      'query parameter',
    );

    const pathParameters = RestRequestConfiguration.validateParameters(
      props.pathParameters,
      'path parameter',
    );

    const headers = RestRequestConfiguration.validateHeaders(
      props.headers,
    );

    const authentication =
      RestRequestConfiguration.validateAuthentication(
        props.authentication,
      );

    const body = RestRequestConfiguration.validateBody(props.body);

    return new RestRequestConfiguration(
      this.id,
      this.endpointId,
      queryParameters,
      pathParameters,
      headers,
      authentication,
      body,
      this.createdAt,
      new Date(),
    );
  }

  static reconstitute(
    props: RestRequestConfigurationProps,
  ): RestRequestConfiguration {
    return new RestRequestConfiguration(
      props.id,
      props.endpointId,
      props.queryParameters,
      props.pathParameters,
      props.headers,
      props.authentication,
      props.body,
      props.createdAt,
      props.updatedAt,
    );
  }

  private static validateParameters(
    parameters: QueryParameter[] | PathParameter[],
    section: string,
  ): (QueryParameter | PathParameter)[] {
    const keys = new Set<string>();

    return parameters.map((parameter) => {
      const key = parameter.key.trim();

      if (!key) {
        throw new InvalidRestRequestConfigurationError(
          `${section} key cannot be empty`,
        );
      }

      if (keys.has(key)) {
        throw new InvalidRestRequestConfigurationError(
          `Duplicate ${section} key: ${key}`,
        );
      }

      if (typeof parameter.value !== 'string') {
        throw new InvalidRestRequestConfigurationError(
          `${section} value must be a string`,
        );
      }

      if (typeof parameter.enabled !== 'boolean') {
        throw new InvalidRestRequestConfigurationError(
          `${section} enabled flag must be a boolean`,
        );
      }

      keys.add(key);

      return {
        ...parameter,
        key,
      };
    });
  }

  private static validateHeaders(
    headers: RequestHeader[],
  ): RequestHeader[] {
    const keys = new Set<string>();

    return headers.map((header) => {
      const key = header.key.trim();

      if (!key) {
        throw new InvalidRestRequestConfigurationError(
          'Header key cannot be empty',
        );
      }

      const normalizedKey = key.toLowerCase();

      if (keys.has(normalizedKey)) {
        throw new InvalidRestRequestConfigurationError(
          `Duplicate header key: ${key}`,
        );
      }

      if (typeof header.value !== 'string') {
        throw new InvalidRestRequestConfigurationError(
          'Header value must be a string',
        );
      }

      if (typeof header.enabled !== 'boolean') {
        throw new InvalidRestRequestConfigurationError(
          'Header enabled flag must be a boolean',
        );
      }

      keys.add(normalizedKey);

      return {
        ...header,
        key,
      };
    });
  }

  private static validateAuthentication(
    authentication: AuthenticationConfig,
  ): AuthenticationConfig {
    switch (authentication.type) {
      case AuthenticationType.NONE:
        return { type: AuthenticationType.NONE };

      case AuthenticationType.BEARER:
      case AuthenticationType.BASIC:
        if (!authentication.credentialReference.trim()) {
          throw new InvalidRestRequestConfigurationError(
            'Authentication credential reference cannot be empty',
          );
        }

        return { ...authentication };

      case AuthenticationType.API_KEY:
        if (!authentication.keyName.trim()) {
          throw new InvalidRestRequestConfigurationError(
            'API key name cannot be empty',
          );
        }

        if (!authentication.credentialReference.trim()) {
          throw new InvalidRestRequestConfigurationError(
            'API key credential reference cannot be empty',
          );
        }

        if (
          authentication.location !== 'HEADER' &&
          authentication.location !== 'QUERY'
        ) {
          throw new InvalidRestRequestConfigurationError(
            'Invalid API key location',
          );
        }

        return { ...authentication };

      default:
        throw new InvalidRestRequestConfigurationError(
          'Invalid authentication type',
        );
    }
  }

  private static validateBody(body: RequestBody): RequestBody {
    switch (body.type) {
      case RequestBodyType.NONE:
        return { type: RequestBodyType.NONE };

      case RequestBodyType.JSON:
        if (typeof body.content !== 'string') {
          throw new InvalidRestRequestConfigurationError(
            'JSON body content must be a string',
          );
        }

        try {
          JSON.parse(body.content);
        } catch {
          throw new InvalidRestRequestConfigurationError(
            'Invalid JSON request body',
          );
        }

        return { ...body };

      case RequestBodyType.FORM_URLENCODED:
      case RequestBodyType.MULTIPART: {
        const fields = this.validateParameters(
          body.fields,
          'request body field',
        );

        return {
          ...body,
          fields,
        };
      }

      case RequestBodyType.RAW_TEXT:
        if (typeof body.content !== 'string') {
          throw new InvalidRestRequestConfigurationError(
            'Raw text body content must be a string',
          );
        }

        if (
          body.contentType !== undefined &&
          !body.contentType.trim()
        ) {
          throw new InvalidRestRequestConfigurationError(
            'Content type cannot be empty',
          );
        }

        return { ...body };

      default:
        throw new InvalidRestRequestConfigurationError(
          'Invalid request body type',
        );
    }
  }
}
