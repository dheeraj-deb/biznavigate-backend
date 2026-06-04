import { AiActionName, ExecuteAiActionDto } from '../dto/ai-action.dto';

export interface AiActionHandler {
  readonly action: AiActionName;
  execute(dto: ExecuteAiActionDto): Promise<Record<string, any>>;
}
