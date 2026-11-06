
 // Project domain entity.

export class InvalidProjectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProjectError';
  }
}

interface ProjectProps {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    workspaceId: string;
    name: string;
    slug: string;
    description?: string | null;
  }): Project {
    const workspaceId = props.workspaceId.trim();
    const name = props.name.trim();

    if (!workspaceId) {
      throw new InvalidProjectError(
        'Project must belong to a workspace',
      );
    }

    if (!name || name.length > 120) {
      throw new InvalidProjectError(
        'Project name must contain between 1 and 120 characters',
      );
    }

    if (!props.slug || props.slug.length > 60) {
      throw new InvalidProjectError('Invalid project slug');
    }

    const description = props.description?.trim() || null;

    if (description && description.length > 500) {
      throw new InvalidProjectError(
        'Project description cannot exceed 500 characters',
      );
    }

    const now = new Date();

    return new Project(
      props.id,
      workspaceId,
      name,
      props.slug,
      description,
      now,
      now,
    );
  }

  static reconstitute(props: ProjectProps): Project {
    return new Project(
      props.id,
      props.workspaceId,
      props.name,
      props.slug,
      props.description,
      props.createdAt,
      props.updatedAt,
    );
  }
}
