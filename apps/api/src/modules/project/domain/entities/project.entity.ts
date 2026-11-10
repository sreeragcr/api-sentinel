
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
  deletedAt: Date | null;
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
    public readonly deletedAt: Date | null,
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
      null,
    );
  }

  updateDetails(props: {
    name?: string;
    slug?: string;
    description?: string | null;
  }): Project {
    if (this.deletedAt !== null) {
      throw new InvalidProjectError(
        'Cannot update a deleted project',
      );
    }

    // Name and slug must be updated together.
    if (
      (props.name === undefined) !==
      (props.slug === undefined)
    ) {
      throw new InvalidProjectError(
        'Project name and slug must be updated together',
      );
    }

    const name =
      props.name === undefined
        ? this.name
        : props.name.trim();

    const slug = props.slug ?? this.slug;

    const description =
      props.description === undefined
        ? this.description
        : props.description?.trim() || null;

    if (!name || name.length > 120) {
      throw new InvalidProjectError(
        'Project name must contain between 1 and 120 characters',
      );
    }

    if (!slug || slug.length > 60) {
      throw new InvalidProjectError('Invalid project slug');
    }

    if (description && description.length > 500) {
      throw new InvalidProjectError(
        'Project description cannot exceed 500 characters',
      );
    }

    return new Project(
      this.id,
      this.workspaceId,
      name,
      slug,
      description,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }

  softDelete(): Project {
    // Deleting an already deleted project is a no-op.
    if (this.deletedAt !== null) {
      return this;
    }

    const now = new Date();

    return new Project(
      this.id,
      this.workspaceId,
      this.name,
      this.slug,
      this.description,
      this.createdAt,
      now,
      now,
    );
  }

  restore(): Project {
    // Restoring an active project is a no-op.
    if (this.deletedAt === null) {
      return this;
    }

    return new Project(
      this.id,
      this.workspaceId,
      this.name,
      this.slug,
      this.description,
      this.createdAt,
      new Date(),
      null,
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
      props.deletedAt,
    );
  }
}
