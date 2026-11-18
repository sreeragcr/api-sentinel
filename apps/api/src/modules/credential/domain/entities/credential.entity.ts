
import { CredentialType } from '../enums/credential-type.enum.js';

export class InvalidCredentialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCredentialError';
  }
}

export interface CredentialProps {
  id: string;
  workspaceId: string;
  name: string;
  type: CredentialType;
  encryptedValue: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Credential {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly type: CredentialType,
    public readonly encryptedValue: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    id: string;
    workspaceId: string;
    name: string;
    type: CredentialType;
    encryptedValue: string;
  }): Credential {
    const id = props.id.trim();
    const workspaceId = props.workspaceId.trim();
    const name = props.name.trim();

    if (!id) {
      throw new InvalidCredentialError('Invalid credential ID');
    }

    if (!workspaceId) {
      throw new InvalidCredentialError('Invalid workspace ID');
    }

    if (!name || name.length > 120) {
      throw new InvalidCredentialError(
        'Credential name must contain between 1 and 120 characters',
      );
    }

    if (!Object.values(CredentialType).includes(props.type)) {
      throw new InvalidCredentialError('Invalid credential type');
    }

    if (!props.encryptedValue.trim()) {
      throw new InvalidCredentialError(
        'Encrypted credential value cannot be empty',
      );
    }

    const now = new Date();

    return new Credential(
      id,
      workspaceId,
      name,
      props.type,
      props.encryptedValue,
      now,
      now,
    );
  }

  update(props: {
    name: string;
    encryptedValue: string;
  }): Credential {
    const name = props.name.trim();

    if (!name || name.length > 120) {
      throw new InvalidCredentialError(
        'Credential name must contain between 1 and 120 characters',
      );
    }

    if (!props.encryptedValue.trim()) {
      throw new InvalidCredentialError(
        'Encrypted credential value cannot be empty',
      );
    }

    return new Credential(
      this.id,
      this.workspaceId,
      name,
      this.type,
      props.encryptedValue,
      this.createdAt,
      new Date(),
    );
  }

  static reconstitute(props: CredentialProps): Credential {
    return new Credential(
      props.id,
      props.workspaceId,
      props.name,
      props.type,
      props.encryptedValue,
      props.createdAt,
      props.updatedAt,
    );
  }
}

