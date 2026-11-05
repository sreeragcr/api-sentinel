import { Query, Resolver } from '@nestjs/graphql';

import { HealthService } from './health.service.js';
import { HealthModel } from './health.model.js';

@Resolver(() => HealthModel)
export class HealthResolver {
  constructor(
    private readonly healthService: HealthService,
  ) {}

  @Query(() => HealthModel)
  health(): HealthModel {
    return this.healthService.check();
  }
}