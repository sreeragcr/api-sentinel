
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import {
  WorkspaceExistenceChecker,
} from '../../application/ports/workspace-existence-checker.js';

@Injectable()
export class PrismaWorkspaceExistenceChecker
  implements WorkspaceExistenceChecker {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async existsById(workspaceId: string): Promise<boolean> {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
      },
    });

    return workspace !== null;
  }
}
