import { InvalidApiEnvironmentError } from '../errors/invalid-api-environment.error.js';

interface ApiEnvironmentProps {
  id: string;
  apiDefinitionId: string;
  name: string;
  baseUrl: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateApiEnvironmentProps {
  name: string;
  baseUrl: string;
  description?: string | null;
}

export class ApiEnvironment {
  private constructor(
    public readonly id: string,
    public readonly apiDefinitionId: string,
    public readonly name: string,
    public readonly baseUrl: string,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    apiDefinitionId: string;
    name: string;
    baseUrl: string;
    description?: string | null;
  }): ApiEnvironment {
    if (!props.id.trim()) {
      throw new InvalidApiEnvironmentError('Invalid environment ID');
    }
    if (!props.apiDefinitionId.trim()) {
      throw new InvalidApiEnvironmentError('Invalid API definition ID');
    }

    const name = props.name.trim();
    if (!name || name.length > 120) {
      throw new InvalidApiEnvironmentError(
        'Environment name must contain between 1 and 120 characters',
      );
    }

    const baseUrl = this.normalizeBaseUrl(props.baseUrl);
    const description = props.description?.trim() || null;
    if (description && description.length > 500) {
      throw new InvalidApiEnvironmentError(
        'Environment description cannot exceed 500 characters',
      );
    }

    const now = new Date();
    return new ApiEnvironment(
      props.id,
      props.apiDefinitionId,
      name,
      baseUrl,
      description,
      now,
      now,
    );
  }

  update(props: UpdateApiEnvironmentProps): ApiEnvironment {
    const updated = ApiEnvironment.create({
      id: this.id,
      apiDefinitionId: this.apiDefinitionId,
      name: props.name,
      baseUrl: props.baseUrl,
      description: props.description,
    });
    return new ApiEnvironment(
      updated.id,
      updated.apiDefinitionId,
      updated.name,
      updated.baseUrl,
      updated.description,
      this.createdAt,
      new Date(),
    );
  }

  static reconstitute(props: ApiEnvironmentProps): ApiEnvironment {
    return new ApiEnvironment(
      props.id,
      props.apiDefinitionId,
      props.name,
      props.baseUrl,
      props.description,
      props.createdAt,
      props.updatedAt,
    );
  }

  private static normalizeBaseUrl(value: string): string {
    const baseUrl = value.trim();
    let url: URL;
    try {
      url = new URL(baseUrl);
    } catch {
      throw new InvalidApiEnvironmentError(
        'Environment base URL must be valid',
      );
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new InvalidApiEnvironmentError(
        'Environment base URL must use HTTP or HTTPS',
      );
    }
    if (url.username || url.password || url.search || url.hash) {
      throw new InvalidApiEnvironmentError(
        'Environment base URL cannot contain credentials, query parameters, or fragments',
      );
    }
    return url.toString().replace(/\/$/, '');
  }
}
