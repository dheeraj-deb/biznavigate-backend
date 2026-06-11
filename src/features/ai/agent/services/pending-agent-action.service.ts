import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BookingService } from '../../../industries/hospitality/bookings/application/services/booking.service';

export type PendingAgentActionType = 'cancel_booking';

export interface PendingAgentAction {
  actionId: string;
  action: PendingAgentActionType;
  businessId: string;
  tenantId?: string | null;
  leadId?: string | null;
  conversationId: string;
  phone: string;
  displayText: string;
  payload: {
    bookingId?: string;
    resolvedBookingId?: string;
  };
  createdAt: string;
}

export interface PendingActionExecutionResult {
  status: 'completed' | 'cancelled' | 'not_found' | 'already_done' | 'expired';
  message: string;
  action?: PendingAgentAction;
}

const PENDING_ACTION_TTL_MS = 10 * 60 * 1000;
const CONFIRM_KEYWORDS = new Set(['confirm', 'yes', 'y', 'ok', 'okay', 'proceed', 'confirm_cancel']);
const REJECT_KEYWORDS = new Set(['no', 'n', 'keep', 'cancel', 'abort', 'stop', 'do_not_cancel', 'keep_booking']);

@Injectable()
export class PendingAgentActionService {
  private readonly logger = new Logger(PendingAgentActionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingService: BookingService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async draftCancelBooking(params: {
    businessId: string;
    tenantId?: string | null;
    leadId?: string | null;
    conversationId: string;
    phone: string;
    bookingId?: string;
  }): Promise<PendingActionExecutionResult> {
    const resolved = await this.resolveCancelableBooking(params.businessId, params.leadId ?? undefined, params.bookingId);
    if (!resolved.hospitalityBooking && !resolved.order) {
      return {
        status: 'not_found',
        message: params.bookingId
          ? `Booking ${params.bookingId} was not found. Please double-check the booking ID.`
          : 'No active booking found for this customer.',
      };
    }

    const displayId = resolved.displayId;
    if (
      resolved.hospitalityBooking?.status === 'cancelled' ||
      resolved.order?.payment_status === 'cancelled' ||
      resolved.order?.status === 'cancelled'
    ) {
      return {
        status: 'already_done',
        message: `Booking ${displayId} has already been cancelled.`,
      };
    }

    const action: PendingAgentAction = {
      actionId: `pending_cancel_${Date.now()}`,
      action: 'cancel_booking',
      businessId: params.businessId,
      tenantId: params.tenantId ?? null,
      leadId: params.leadId ?? null,
      conversationId: params.conversationId,
      phone: params.phone,
      displayText: `Cancel booking ${displayId}`,
      payload: {
        bookingId: params.bookingId,
        resolvedBookingId: resolved.resolvedBookingId,
      },
      createdAt: new Date().toISOString(),
    };

    await this.cache.set(this.cacheKey(params.conversationId), action, PENDING_ACTION_TTL_MS);
    return {
      status: 'completed',
      action,
      message: `Please confirm: should I cancel booking ${displayId}?`,
    };
  }

  async getPending(conversationId: string): Promise<PendingAgentAction | null> {
    return (await this.cache.get<PendingAgentAction>(this.cacheKey(conversationId))) ?? null;
  }

  parseDecision(input: string): 'confirm' | 'reject' | null {
    const normalized = input.trim().toLowerCase();
    if (CONFIRM_KEYWORDS.has(normalized)) return 'confirm';
    if (REJECT_KEYWORDS.has(normalized)) return 'reject';
    return null;
  }

  async resolvePending(conversationId: string, decision: 'confirm' | 'reject'): Promise<PendingActionExecutionResult> {
    const action = await this.getPending(conversationId);
    if (!action) {
      return { status: 'expired', message: 'That confirmation has expired. Please send the request again.' };
    }

    await this.cache.del(this.cacheKey(conversationId));

    if (decision === 'reject') {
      return {
        status: 'cancelled',
        action,
        message: 'Okay, I have not made any changes.',
      };
    }

    if (action.action === 'cancel_booking') {
      return this.executeCancelBooking(action);
    }

    return { status: 'expired', action, message: 'That action is no longer supported. Please send the request again.' };
  }

  private async executeCancelBooking(action: PendingAgentAction): Promise<PendingActionExecutionResult> {
    const resolved = await this.resolveCancelableBooking(
      action.businessId,
      action.leadId ?? undefined,
      action.payload.resolvedBookingId ?? action.payload.bookingId,
    );
    const displayId = resolved.displayId ?? action.payload.resolvedBookingId ?? action.payload.bookingId ?? 'this booking';

    if (!resolved.hospitalityBooking && !resolved.order) {
      return {
        status: 'not_found',
        action,
        message: `Booking ${displayId} was not found. Please double-check the booking ID.`,
      };
    }

    if (
      resolved.hospitalityBooking?.status === 'cancelled' ||
      resolved.order?.payment_status === 'cancelled' ||
      resolved.order?.status === 'cancelled'
    ) {
      return {
        status: 'already_done',
        action,
        message: `Booking ${displayId} has already been cancelled.`,
      };
    }

    if (resolved.hospitalityBooking) {
      await this.bookingService.cancelBooking(
        resolved.hospitalityBooking.hospitality_booking_id,
        action.businessId,
        'ai',
      );
    } else if (resolved.order) {
      await this.prisma.$transaction(async (tx) => {
        await tx.orders.update({
          where: { order_id: resolved.order.order_id },
          data: {
            status: 'cancelled',
            payment_status: 'cancelled',
            cancelled_at: new Date(),
            updated_at: new Date(),
          },
        });
      });
    }

    this.logger.log(`Confirmed cancel_booking executed for ${displayId}`);
    return {
      status: 'completed',
      action,
      message: `Booking ${displayId} has been successfully cancelled. You will receive a confirmation shortly.`,
    };
  }

  private async resolveCancelableBooking(businessId: string, leadId?: string, bookingId?: string) {
    let resolvedBookingId = bookingId;
    let order: any = null;
    let hospitalityBooking: any = null;

    if (!resolvedBookingId && leadId) {
      hospitalityBooking = await this.prisma.hospitality_bookings.findFirst({
        where: {
          business_id: businessId,
          lead_id: leadId,
          status: { not: 'cancelled' },
        },
        orderBy: { created_at: 'desc' },
        include: { legacy_order: true },
      });
      order = hospitalityBooking?.legacy_order ?? null;

      if (!hospitalityBooking) {
        order = await this.prisma.orders.findFirst({
          where: {
            business_id: businessId,
            lead_id: leadId,
            payment_status: { in: ['pending', 'paid'] },
            status: { not: 'cancelled' },
          },
          orderBy: { created_at: 'desc' },
        });
      }

      resolvedBookingId = hospitalityBooking?.hospitality_booking_id ?? order?.order_id;
    }

    if (!hospitalityBooking && resolvedBookingId) {
      const orderFilters: any[] = [{ order_number: resolvedBookingId }];
      if (this.isUuid(resolvedBookingId)) orderFilters.push({ order_id: resolvedBookingId });

      const bookingFilters: any[] = [{ booking_number: resolvedBookingId }];
      if (this.isUuid(resolvedBookingId)) bookingFilters.push({ hospitality_booking_id: resolvedBookingId });

      hospitalityBooking = await this.prisma.hospitality_bookings.findFirst({
        where: {
          business_id: businessId,
          OR: bookingFilters,
        },
        include: { legacy_order: true },
      });
      order = hospitalityBooking?.legacy_order ?? null;

      if (!hospitalityBooking) {
        order = await this.prisma.orders.findFirst({
          where: {
            business_id: businessId,
            OR: orderFilters,
          },
        });

        if (order) {
          hospitalityBooking = await this.prisma.hospitality_bookings.findFirst({
            where: {
              business_id: businessId,
              legacy_order_id: order.order_id,
            },
            include: { legacy_order: true },
          });
          order = hospitalityBooking?.legacy_order ?? order;
        }
      }
    }

    return {
      hospitalityBooking,
      order,
      resolvedBookingId,
      displayId: hospitalityBooking?.booking_number ?? order?.order_number ?? resolvedBookingId,
    };
  }

  private cacheKey(conversationId: string): string {
    return `agent:pending_action:${conversationId}`;
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
  }
}
