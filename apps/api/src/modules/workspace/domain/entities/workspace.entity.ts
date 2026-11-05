// Workspace domain entity.

export class InvalidWorkspaceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWorkspaceError';
  }
}

interface WorkspaceProps {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Workspace {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  }): Workspace {
    const name = props.name.trim();

    if (!name || name.length > 120) {
      throw new InvalidWorkspaceError(
        'Workspace name must contain between 1 and 120 characters',
      );
    }

    if (!props.slug || props.slug.length > 60) {
      throw new InvalidWorkspaceError('Invalid workspace slug');
    }

    const description = props.description?.trim() || null;

    if (description && description.length > 500) {
      throw new InvalidWorkspaceError(
        'Workspace description cannot exceed 500 characters',
      );
    }

    const now = new Date();

    return new Workspace(
      props.id,
      name,
      props.slug,
      description,
      now,
      now,
    );
  }

  static reconstitute(props: WorkspaceProps): Workspace {
    return new Workspace(
      props.id,
      props.name,
      props.slug,
      props.description,
      props.createdAt,
      props.updatedAt,
    );
  }
}
