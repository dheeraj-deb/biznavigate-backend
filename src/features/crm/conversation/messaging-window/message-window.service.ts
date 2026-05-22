import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from '../schemas/conversations.schema';

export interface WindowStatus {
  open: boolean;
  /** ISO timestamp of the last inbound message, or null if we've never received one. */
  lastInboundAt: string | null;
  /** When the window will close. null when open is false. */
  closesAt: string | null;
}

const WINDOW_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry {
  status: WindowStatus;
  expiresAt: number;
}

/**
 * Authoritative source on whether automations can send free-form WhatsApp text
 * to a given customer. WhatsApp Business API only permits free-form messages
 * inside the 24-hour customer-service window (anchored to the customer's most
 * recent inbound message). Outside that window, only approved templates can be
 * sent.
 *
 * Reads conversations.last_inbound_at (set by ConversationService.markInbound
 * on every inbound persist). Caches each (business_id, lead_id) lookup for 60s
 * so a fan-out of 500 leads doesn't translate to 500 round-trips when nobody
 * has messaged in.
 *
 * Scope: this gate is consulted by automation send paths only. Live inbox
 * replies are inherently inside the window (a human is replying because a
 * message arrived). Marketing templates are approved at submission time and
 * don't need the gate.
 */
@Injectable()
export class MessageWindowService {
  private readonly logger = new Logger(MessageWindowService.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  async getStatus(params: { business_id: string; lead_id: string; channel?: string }): Promise<WindowStatus> {
    const key = this.cacheKey(params.business_id, params.lead_id);
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.status;

    const channel = params.channel || 'whatsapp';
    const conversation = await this.conversationModel
      .findOne({ business_id: params.business_id, lead_id: params.lead_id, channel })
      .select({ last_inbound_at: 1 })
      .lean();

    const lastInboundAt = conversation?.last_inbound_at ?? null;
    const status = this.computeStatus(lastInboundAt);
    this.cache.set(key, { status, expiresAt: Date.now() + CACHE_TTL_MS });
    return status;
  }

  /** Invalidate the cache for a (business, lead) pair after an inbound message lands. */
  invalidate(business_id: string, lead_id: string): void {
    this.cache.delete(this.cacheKey(business_id, lead_id));
  }

  private cacheKey(business_id: string, lead_id: string): string {
    return `${business_id}::${lead_id}`;
  }

  private computeStatus(lastInboundAt: Date | null | undefined): WindowStatus {
    if (!lastInboundAt) {
      return { open: false, lastInboundAt: null, closesAt: null };
    }
    const last = new Date(lastInboundAt);
    const closesAt = new Date(last.getTime() + WINDOW_MS);
    const open = closesAt.getTime() > Date.now();
    return {
      open,
      lastInboundAt: last.toISOString(),
      closesAt: open ? closesAt.toISOString() : null,
    };
  }
}
