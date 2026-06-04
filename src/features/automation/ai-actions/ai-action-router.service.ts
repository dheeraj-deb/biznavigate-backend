import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../platform/audit-log/audit-log.service';
import { AiActionExecutionResult, AiActionName, ExecuteAiActionDto } from './dto/ai-action.dto';
import { AiActionHandler } from './handlers/ai-action-handler';
import { CheckRoomAvailabilityHandler } from './handlers/check-room-availability.handler';
import { CreateHospitalityBookingHandler } from './handlers/create-hospitality-booking.handler';
import { CreateHospitalityInquiryHandler } from './handlers/create-hospitality-inquiry.handler';
import { CreateProductInquiryHandler } from './handlers/create-product-inquiry.handler';
import { CreateProductOrderHandler } from './handlers/create-product-order.handler';
import { HandoffToHumanHandler } from './handlers/handoff-to-human.handler';

@Injectable()
export class AiActionRouterService {
  private readonly handlers: Map<AiActionName, AiActionHandler>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    checkRoomAvailability: CheckRoomAvailabilityHandler,
    createHospitalityBooking: CreateHospitalityBookingHandler,
    createHospitalityInquiry: CreateHospitalityInquiryHandler,
    createProductInquiry: CreateProductInquiryHandler,
    createProductOrder: CreateProductOrderHandler,
    handoffToHuman: HandoffToHumanHandler,
  ) {
    this.handlers = new Map<AiActionName, AiActionHandler>([
      [checkRoomAvailability.action, checkRoomAvailability],
      [createHospitalityBooking.action, createHospitalityBooking],
      [createHospitalityInquiry.action, createHospitalityInquiry],
      [createProductInquiry.action, createProductInquiry],
      [createProductOrder.action, createProductOrder],
      [handoffToHuman.action, handoffToHuman],
    ]);
  }

  async execute(dto: ExecuteAiActionDto): Promise<AiActionExecutionResult> {
    const handler = this.handlers.get(dto.action);
    if (!handler) throw new BadRequestException(`Unsupported AI action: ${dto.action}`);

    await this.assertBusinessScope(dto);
    const idempotencyKey = dto.idempotency_key || this.buildIdempotencyKey(dto);
    const existingKey = await this.prisma.workflow_idempotency_keys.findUnique({
      where: { idempotency_key: idempotencyKey },
    });

    if (existingKey?.status === 'completed' && existingKey.response) {
      return existingKey.response as unknown as AiActionExecutionResult;
    }

    if (existingKey?.status === 'started' && (!existingKey.locked_until || existingKey.locked_until > new Date())) {
      throw new ConflictException('AI action is already being processed');
    }

    const shouldReclaimKey = existingKey?.status === 'failed' ||
      (existingKey?.status === 'started' && existingKey.locked_until && existingKey.locked_until <= new Date());

    await this.reserveIdempotencyKey(dto, idempotencyKey, shouldReclaimKey);

    try {
      const handlerResult = await handler.execute({ ...dto, idempotency_key: idempotencyKey });
      const response: AiActionExecutionResult = {
        action: dto.action,
        status: 'completed',
        result: handlerResult,
        idempotency_key: idempotencyKey,
      };

      await this.prisma.workflow_idempotency_keys.update({
        where: { idempotency_key: idempotencyKey },
        data: {
          status: 'completed',
          response: response as any,
          locked_until: null,
          updated_at: new Date(),
        },
      });

      await this.auditLogService.log({
        business_id: dto.business_id,
        action: dto.action,
        entity_type: 'ai_action',
        entity_id: idempotencyKey,
        new_values: response as unknown as Record<string, unknown>,
      });

      return response;
    } catch (error) {
      await this.prisma.workflow_idempotency_keys.update({
        where: { idempotency_key: idempotencyKey },
        data: {
          status: 'failed',
          locked_until: null,
          response: {
            action: dto.action,
            error: error.message,
          } as any,
          updated_at: new Date(),
        },
      }).catch(() => undefined);
      throw error;
    }
  }

  private async assertBusinessScope(dto: ExecuteAiActionDto) {
    const business = await this.prisma.businesses.findUnique({
      where: { business_id: dto.business_id },
      select: { business_id: true, tenant_id: true },
    });
    if (!business) throw new NotFoundException('Business not found');

    if (dto.tenant_id && dto.tenant_id !== business.tenant_id) {
      throw new BadRequestException('tenant_id does not match business');
    }

    if (dto.lead_id) {
      const lead = await this.prisma.leads.findFirst({
        where: {
          lead_id: dto.lead_id,
          business_id: dto.business_id,
          tenant_id: dto.tenant_id ?? business.tenant_id,
        },
        select: { lead_id: true },
      });
      if (!lead) throw new NotFoundException('Lead not found');
    }
  }

  private buildIdempotencyKey(dto: ExecuteAiActionDto) {
    const raw = JSON.stringify({
      action: dto.action,
      business_id: dto.business_id,
      tenant_id: dto.tenant_id ?? null,
      lead_id: dto.lead_id ?? null,
      conversation_id: dto.conversation_id ?? null,
      params: dto.params,
    });

    return `ai_action:${dto.action}:${createHash('sha256').update(raw).digest('hex')}`;
  }

  private async reserveIdempotencyKey(dto: ExecuteAiActionDto, idempotencyKey: string, reclaim: boolean) {
    const data = {
      business_id: dto.business_id,
      tenant_id: dto.tenant_id ?? null,
      lead_id: dto.lead_id ?? null,
      conversation_id: dto.conversation_id ?? null,
      idempotency_key: idempotencyKey,
      purpose: `ai_action:${dto.action}`,
      status: 'started',
      locked_until: new Date(Date.now() + 5 * 60 * 1000),
      node_id: dto.action,
    };

    if (reclaim) {
      await this.prisma.workflow_idempotency_keys.update({
        where: { idempotency_key: idempotencyKey },
        data: {
          status: 'started',
          response: null,
          locked_until: data.locked_until,
          updated_at: new Date(),
        },
      });
      return;
    }

    try {
      await this.prisma.workflow_idempotency_keys.create({ data });
    } catch (error) {
      if (error?.code === 'P2002') {
        throw new ConflictException('AI action is already being processed');
      }
      throw error;
    }
  }
}
