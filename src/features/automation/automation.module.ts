import { DynamicModule, Module } from '@nestjs/common';
import { AiActionsModule } from './ai-actions/ai-actions.module';
import { WorkflowsModule } from './workflows/workflows.module';

/**
 * Automation boundary module.
 *
 * Deterministic AI actions are PostgreSQL-backed and safe as the base
 * automation capability. Workflow definitions/executions currently depend on
 * Mongo and channel modules, so the app composes workflows only when those
 * runtime dependencies are enabled.
 */
@Module({
  imports: [AiActionsModule],
  exports: [AiActionsModule],
})
export class AutomationModule {
  static withWorkflows(): DynamicModule {
    return {
      module: AutomationModule,
      imports: [AiActionsModule, WorkflowsModule],
      exports: [AiActionsModule, WorkflowsModule],
    };
  }
}
