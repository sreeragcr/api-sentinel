
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../shared/infrastructure/database/prisma.service.js';

import { ProjectExistenceChecker } from '../../application/ports/project-existence-checker.js';

@Injectable()
export class PrismaProjectExistenceChecker
  implements ProjectExistenceChecker
{
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async existsById(projectId: string): Promise<boolean> {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    return project !== null;
  }
}
