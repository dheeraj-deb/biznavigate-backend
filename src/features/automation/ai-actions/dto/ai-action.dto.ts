import { IsIn, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export const AI_ACTION_NAMES = [
  'check_room_availability',
  'create_hospitality_inquiry',
  'create_hospitality_booking',
  'create_product_inquiry',
  'create_product_order',
  'handoff_to_human',
] as const;

export type AiActionName = (typeof AI_ACTION_NAMES)[number];

export class ExecuteAiActionDto {
  @IsIn(AI_ACTION_NAMES)
  action: AiActionName;

  @IsUUID()
  business_id: string;

  @IsUUID()
  @IsOptional()
  tenant_id?: string;

  @IsUUID()
  @IsOptional()
  lead_id?: string;

  @IsUUID()
  @IsOptional()
  conversation_id?: string;

  @IsString()
  @IsOptional()
  idempotency_key?: string;

  @IsObject()
  params: Record<string, any>;
}

export interface AiActionExecutionResult {
  action: AiActionName;
  status: 'completed';
  result: Record<string, any>;
  idempotency_key: string;
}
