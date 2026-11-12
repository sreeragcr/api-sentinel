
import { HttpMethod } from '../enums/http-method.enum.js';

export class InvalidRestEndpointError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRestEndpointError';
  }
}

interface RestEndpointProps {
  id: string;
  apiDefinitionId: string;
  name: string;
  description: string | null;
  method: HttpMethod;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RestEndpoint {
  private constructor(
    public readonly id: string,
    public readonly apiDefinitionId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly method: HttpMethod,
    public readonly path: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    apiDefinitionId: string;
    name: string;
    description?: string | null;
    method: HttpMethod;
    path: string;
  }): RestEndpoint {
    const name = props.name.trim();

    if (!name || name.length > 120) {
      throw new InvalidRestEndpointError(
        'Endpoint name must contain between 1 and 120 characters',
      );
    }

    if (!props.id.trim()) {
      throw new InvalidRestEndpointError('Invalid endpoint ID');
    }

    if (!props.apiDefinitionId.trim()) {
      throw new InvalidRestEndpointError(
        'Invalid API definition ID',
      );
    }

    if (!Object.values(HttpMethod).includes(props.method)) {
      throw new InvalidRestEndpointError(
        'Invalid HTTP method',
      );
    }

    const path = props.path.trim();

    if (!path || !path.startsWith('/')) {
      throw new InvalidRestEndpointError(
        'Endpoint path must start with /',
      );
    }

    if (path.includes('?') || path.includes('#')) {
      throw new InvalidRestEndpointError(
        'Endpoint path cannot contain query parameters or fragments',
      );
    }

    const description = props.description?.trim() || null;

    if (description && description.length > 500) {
      throw new InvalidRestEndpointError(
        'Endpoint description cannot exceed 500 characters',
      );
    }

    const now = new Date();

    return new RestEndpoint(
      props.id,
      props.apiDefinitionId,
      name,
      description,
      props.method,
      path,
      now,
      now,
    );
  }

  static reconstitute(props: RestEndpointProps): RestEndpoint {
    return new RestEndpoint(
      props.id,
      props.apiDefinitionId,
      props.name,
      props.description,
      props.method,
      props.path,
      props.createdAt,
      props.updatedAt,
    );
  }
}
