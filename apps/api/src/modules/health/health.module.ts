import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { HealthResolver } from './health.resolver.js';


@Module({
  controllers: [HealthController],
  providers: [HealthService, HealthResolver],
})
export class HealthModule {}