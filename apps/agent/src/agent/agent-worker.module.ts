import { Module } from '@nestjs/common';
import { AgentModule } from './agent.module';
import { AgentProcessor } from './agent.processor';

@Module({
  imports: [AgentModule],
  providers: [AgentProcessor],
})
export class AgentWorkerModule {}
