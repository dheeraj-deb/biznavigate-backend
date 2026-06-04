import {
  Body,
  Controller,
  Headers,
  Logger,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IsIn, IsObject, IsString } from 'class-validator';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LeadCommandService } from '../../../crm/lead/application/services/lead-command.service';

const EXTERNAL_EVENT_NAMES = [
  'booking.created',
  'booking.cancelled',
  'booking.link_sent',
  'booking.followup_due',
  'booking.checkin_reminder_due',
  'booking.review_request_due',
  'room.available',
  'order.placed',
  'order.status_changed',
  'payment.received',
  'payment.waiting',
  'inventory.price_changed',
  'inventory.item_added',
  'inventory.restocked',
  'stock.held',
  'slot.opened',
  'credit.due',
  'dead_stock.offer',
  'vehicle.details_shared',
  'vehicle.visit_slots_available',
] as const;

class ExternalWorkflowEventDto {
  @IsString()
  @IsIn(EXTERNAL_EVENT_NAMES)
  eventName: (typeof EXTERNAL_EVENT_NAMES)[number];

  @IsObject()
  payload: Record<string, any>;
}

@Controller('webhooks/:tenantId/events')
export class ExternalWorkflowEventsController {
  private readonly logger = new Logger(ExternalWorkflowEventsController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly leadCommand: LeadCommandService,
  ) {}

  @Post()
  async receive(
    @Param('tenantId') tenantId: string,
    @Headers('x-webhook-secret') webhookSecret: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: ExternalWorkflowEventDto,
  ) {
    this.validateSecret(webhookSecret, authorization);

    const tenant = await this.prisma.tenants.findUnique({
      where: { tenant_id: tenantId },
      select: { tenant_id: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const businessId = await this.resolveBusinessId(tenantId, body.payload);
    const leadId = typeof body.payload.lead_id === 'string' ? body.payload.lead_id : undefined;

    await this.applyLeadTransition(body.eventName, leadId);

    this.eventEmitter.emit(`workflow.event.${body.eventName}`, {
      business_id: businessId,
      tenant_id: tenantId,
      lead_id: leadId,
      event_name: body.eventName,
      payload: body.payload,
      emitted_at: new Date().toISOString(),
    });

    this.logger.log(`External workflow event accepted: ${body.eventName} tenant=${tenantId}`);
    return { accepted: true, eventName: body.eventName };
  }

  private validateSecret(webhookSecret?: string, authorization?: string) {
    const expected = process.env.WORKFLOW_EVENT_WEBHOOK_SECRET;
    if (!expected) return;

    const bearer = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : undefined;
    if (webhookSecret !== expected && bearer !== expected) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
  }

  private async resolveBusinessId(tenantId: string, payload: Record<string, any>): Promise<string> {
    if (typeof payload.business_id === 'string') {
      const business = await this.prisma.businesses.findFirst({
        where: { business_id: payload.business_id, tenant_id: tenantId },
        select: { business_id: true },
      });
      if (business) return business.business_id;
      throw new NotFoundException('Business not found for tenant');
    }

    const business = await this.prisma.businesses.findFirst({
      where: { tenant_id: tenantId, deleted_at: null },
      orderBy: { created_at: 'asc' },
      select: { business_id: true },
    });
    if (!business) throw new NotFoundException('Business not found for tenant');
    return business.business_id;
  }

  private async applyLeadTransition(eventName: string, leadId?: string) {
    if (!leadId) return;

    const targetStatus = this.statusForEvent(eventName);
    if (!targetStatus) return;

    try {
      await this.leadCommand.updateStatus(leadId, targetStatus, {
        actor: 'system',
      });
    } catch (err: any) {
      this.logger.warn(`Lead transition skipped for ${leadId}: ${err?.message ?? err}`);
    }
  }

  private statusForEvent(eventName: string): string | null {
    switch (eventName) {
      case 'booking.created':
        return 'booked';
      case 'booking.cancelled':
        return 'cancelled';
      case 'order.placed':
      case 'payment.received':
        return 'won';
      default:
        return null;
    }
  }
}
