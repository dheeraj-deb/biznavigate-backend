import { Module } from '@nestjs/common';
import { AiRouterService } from './ai-router.service';

@Module({
  providers: [AiRouterService],
  exports: [AiRouterService],
})
export class AiRouterModule {}
