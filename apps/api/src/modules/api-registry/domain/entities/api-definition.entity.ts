// API Definition domain entity.

import { ApiProtocol } from '../api-protocol.enum.js';

export class InvalidApiDefinitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidApiDefinitionError';
  }
}

interface ApiDefinitionProps {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  protocol: ApiProtocol;
  createdAt: Date;
  updatedAt: Date;
}

export class ApiDefinition {
  private constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly protocol: ApiProtocol,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    projectId: string;
    name: string;
    description?: string | null;
    protocol: ApiProtocol;
  }): ApiDefinition {
    const name = props.name.trim();

    if (!name || name.length > 120) {
      throw new InvalidApiDefinitionError(
        'API name must contain between 1 and 120 characters',
      );
    }

    if (!props.id.trim()) {
      throw new InvalidApiDefinitionError('Invalid API ID');
    }

    if (!props.projectId.trim()) {
      throw new InvalidApiDefinitionError('Invalid project ID');
    }

    if (!Object.values(ApiProtocol).includes(props.protocol)) {
      throw new InvalidApiDefinitionError('Invalid API protocol');
    }

    const description = props.description?.trim() || null;

    if (description && description.length > 500) {
      throw new InvalidApiDefinitionError(
        'API description cannot exceed 500 characters',
      );
    }

    const now = new Date();

    return new ApiDefinition(
      props.id,
      props.projectId,
      name,
      description,
      props.protocol,
      now,
      now,
    );
  }

  static reconstitute(props: ApiDefinitionProps): ApiDefinition {
    return new ApiDefinition(
      props.id,
      props.projectId,
      props.name,
      props.description,
      props.protocol,
      props.createdAt,
      props.updatedAt,
    );
  }
}