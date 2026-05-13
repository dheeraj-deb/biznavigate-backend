import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { Campaign, CampaignDocument } from '../../../campaign/schemas/campaign.schema';
import { CampaignStatus } from '../../../campaign/enums/enums';
import { ConversationService } from '../../../../crm/conversation/conversation.service';
import { InboxGateway } from '../../../../crm/inbox/gateway/inbox.gateway';

@Injectable()
export class WhatsAppStatusCommandService {
  private readonly logger = new Logger(WhatsAppStatusCommandService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationService: ConversationService,
    private readonly inboxGateway: InboxGateway,
    @InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>,
  ) {}

  async handleStatusWebhook(status: any, metadata?: any): Promise<void> {
    try {
      const messageId = status.id;
      const statusType = status.status;

      this.logger.log(
        `Message ${messageId} status: ${statusType} recipient=${status.recipient_id ?? 'unknown'} phoneNumberId=${metadata?.phone_number_id ?? 'unknown'}`,
      );

      const deliveryStatusMap: Record<string, string> = {
        sent: 'sent',
        delivered: 'delivered',
        read: 'read',
        failed: 'failed',
      };

      const timestamp = this.parseWebhookTimestamp(status.timestamp);

      const updateData: any = {
        delivery_status: deliveryStatusMap[statusType] || statusType,
      };

      if (statusType === 'delivered') {
        updateData.delivered_at = timestamp;
      } else if (statusType === 'read') {
        updateData.read_at = timestamp;
      } else if (statusType === 'failed') {
        updateData.failed_reason = status.errors?.[0]?.message || 'Unknown error';
      }

      await this.conversationService.updateMessageStatus(messageId, updateData);

      if (status.errors && status.errors.length > 0) {
        this.logger.error(`Message ${messageId} failed:`, status.errors);
      }

      const msg = await this.conversationService.findMessageByPlatformId(messageId);
      if (msg) {
        const conv = await this.conversationService.findConversationById(msg.conversation_id);
        if (conv) {
          this.inboxGateway.notifyStatusUpdate(conv.business_id, conv.conversation_id, messageId, statusType);
        }
      }

      await this.updateCampaignRecipientStatus(messageId, statusType, timestamp, status.errors, status, metadata);
    } catch (error) {
      this.logger.error('Error processing status webhook:', error);
    }
  }

  async handleGupshupMessageEvent(event: any): Promise<void> {
    const payload = event?.payload;
    if (!payload?.type || !payload?.id) {
      this.logger.warn(`[GupshupMessageEvent] Ignoring malformed event: ${JSON.stringify(event)}`);
      return;
    }

    const eventType = String(payload.type).toLowerCase();
    const statusTypeMap: Record<string, string> = {
      enqueued: 'enqueued',
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
      deleted: 'deleted',
    };
    const statusType = statusTypeMap[eventType] ?? eventType;

    const status = {
      id: payload.id,
      gsId: payload.gsId,
      status: statusType,
      timestamp: payload.ts ?? payload.timestamp ?? event.timestamp,
      recipient_id: payload.destination,
      errors: statusType === 'failed'
        ? [this.normalizeGupshupFailure(payload.payload)]
        : undefined,
    };

    this.logger.log(
      `[GupshupMessageEvent] id=${payload.id} gsId=${payload.gsId ?? 'none'} type=${statusType} destination=${payload.destination ?? 'unknown'}`,
    );

    await this.handleStatusWebhook(status, {
      gupshup_app_id: event.gs_app_id ?? event.appId ?? event.app,
    });
  }

  private parseWebhookTimestamp(value: any): Date {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return new Date();
    }

    const millis = numeric > 10_000_000_000 ? numeric : numeric * 1000;
    const date = new Date(millis);

    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  private normalizeGupshupFailure(payload: any): any {
    if (!payload) {
      return { code: 'GUPSHUP_FAILED', message: 'Gupshup reported message failure' };
    }

    if (typeof payload === 'string') {
      return { code: 'GUPSHUP_FAILED', message: payload };
    }

    return {
      code: payload.code ?? payload.errorCode ?? payload.reasonCode ?? 'GUPSHUP_FAILED',
      message: payload.reason || payload.message || payload.error || payload.description || JSON.stringify(payload),
      error_data: payload,
    };
  }

  private async updateCampaignRecipientStatus(
    waMessageId: string,
    statusType: string,
    timestamp: Date,
    errors?: any[],
    rawStatus?: any,
    metadata?: any,
  ): Promise<void> {
    const campaignStatusMap: Record<string, string> = {
      delivered: 'DELIVERED',
      read: 'READ',
      failed: 'FAILED',
    };

    const campaignStatus = campaignStatusMap[statusType];
    if (!campaignStatus) return;

    const messageIds = [
      waMessageId,
      rawStatus?.gsId,
      rawStatus?.gs_id,
      rawStatus?.meta_msg_id,
    ].filter((id): id is string => typeof id === 'string' && id.length > 0);

    let recipient = await this.prisma.campaign_recipients.findFirst({
      where: { whatsapp_message_id: { in: messageIds } },
      select: {
        id: true,
        campaign_id: true,
        business_id: true,
        whatsapp_message_id: true,
        status: true,
        sent_at: true,
        delivered_at: true,
        read_at: true,
        failed_at: true,
      },
    });

    if (!recipient) {
      recipient = await this.findRecentCampaignRecipientForStatus(rawStatus, metadata, timestamp);
    }

    if (!recipient) {
      this.logger.warn(
        `[CampaignDelivery] No campaign recipient matched status=${statusType} messageId=${waMessageId} recipient=${rawStatus?.recipient_id ?? 'unknown'} phoneNumberId=${metadata?.phone_number_id ?? 'unknown'}`,
      );
      return;
    }

    if (recipient.status === 'READ' && campaignStatus === 'DELIVERED') {
      this.logger.debug(`[CampaignDelivery] Ignoring stale delivered status for already-read recipient ${recipient.id}`);
      return;
    }

    if (['DELIVERED', 'READ', 'FAILED'].includes(recipient.status) && campaignStatus === 'FAILED') {
      this.logger.debug(
        `[CampaignDelivery] Ignoring failed status for already-${recipient.status.toLowerCase()} recipient ${recipient.id}`,
      );
      return;
    }

    const recipientUpdate: any = { status: campaignStatus, updated_at: timestamp };
    if (waMessageId && recipient.whatsapp_message_id !== waMessageId) {
      recipientUpdate.whatsapp_message_id = waMessageId;
    }
    if (statusType === 'delivered') {
      if (!recipient.delivered_at) recipientUpdate.delivered_at = timestamp;
    } else if (statusType === 'read') {
      if (!recipient.delivered_at) recipientUpdate.delivered_at = timestamp;
      if (!recipient.read_at) recipientUpdate.read_at = timestamp;
    } else if (statusType === 'failed') {
      const err = errors?.[0];
      if (!recipient.failed_at) recipientUpdate.failed_at = timestamp;
      recipientUpdate.error_code = String(err?.code ?? 'UNKNOWN');
      recipientUpdate.error_message = err?.error_data?.details || err?.message || err?.title || 'Unknown error';
    }

    await this.prisma.campaign_recipients.update({
      where: { id: recipient.id },
      data: recipientUpdate,
    });

    const snapshot = await this.recomputeCampaignAnalytics(recipient.campaign_id, recipient.business_id);
    await this.syncCampaignStatusFromDelivery(recipient.campaign_id, snapshot);

    this.logger.log(`[Campaign ${recipient.campaign_id}] Recipient ${waMessageId} -> ${campaignStatus}`);
  }

  private async recomputeCampaignAnalytics(
    campaignId: string,
    businessId: string,
  ): Promise<{
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    pending: number;
    awaitingDelivery: number;
  }> {
    const [total, sent, delivered, read, failed, pending, awaitingDelivery] = await Promise.all([
      this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId } }),
      this.prisma.campaign_recipients.count({
        where: {
          campaign_id: campaignId,
          OR: [
            { sent_at: { not: null } },
            { status: { in: ['SENT', 'DELIVERED', 'READ'] } },
          ],
        },
      }),
      this.prisma.campaign_recipients.count({
        where: {
          campaign_id: campaignId,
          OR: [
            { delivered_at: { not: null } },
            { status: { in: ['DELIVERED', 'READ'] } },
          ],
        },
      }),
      this.prisma.campaign_recipients.count({
        where: {
          campaign_id: campaignId,
          OR: [
            { read_at: { not: null } },
            { status: 'READ' },
          ],
        },
      }),
      this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId, status: 'FAILED' } }),
      this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId, status: 'PENDING' } }),
      this.prisma.campaign_recipients.count({ where: { campaign_id: campaignId, status: { in: ['PENDING', 'SENT'] } } }),
    ]);

    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
    const readRate = delivered > 0 ? (read / delivered) * 100 : 0;

    await this.prisma.campaign_analytics.upsert({
      where: { campaign_id: campaignId },
      create: {
        campaign_id: campaignId,
        business_id: businessId,
        total, sent, delivered, read, failed, pending,
        delivery_rate: deliveryRate,
        read_rate: readRate,
        last_synced_at: new Date(),
        updated_at: new Date(),
      },
      update: {
        total, sent, delivered, read, failed, pending,
        delivery_rate: deliveryRate,
        read_rate: readRate,
        last_synced_at: new Date(),
        updated_at: new Date(),
      },
    });

    return { total, sent, delivered, read, failed, pending, awaitingDelivery };
  }

  private async syncCampaignStatusFromDelivery(
    campaignId: string,
    snapshot: { total: number; failed: number; awaitingDelivery: number },
  ): Promise<void> {
    if (snapshot.total === 0) return;

    const campaign = await this.campaignModel
      .findById(campaignId)
      .select('status completedAt')
      .lean();

    if (!campaign) {
      this.logger.warn(`[CampaignDelivery] Campaign ${campaignId} not found while syncing delivery status`);
      return;
    }

    const currentStatus = (campaign as any).status as CampaignStatus;
    if ([CampaignStatus.CANCELLED, CampaignStatus.PAUSED, CampaignStatus.DRAFT].includes(currentStatus)) {
      return;
    }

    if (snapshot.awaitingDelivery > 0) {
      if (currentStatus === CampaignStatus.COMPLETED) {
        await this.campaignModel.findByIdAndUpdate(campaignId, {
          $set: { status: CampaignStatus.RUNNING },
          $unset: { completedAt: 1, failureReason: 1 },
        });
        this.logger.log(
          `[Campaign ${campaignId}] Status -> RUNNING (${snapshot.awaitingDelivery} recipient(s) still awaiting delivery status)`,
        );
      }
      return;
    }

    const nextStatus = snapshot.failed === snapshot.total
      ? CampaignStatus.FAILED
      : CampaignStatus.COMPLETED;

    if (currentStatus === nextStatus && (campaign as any).completedAt) {
      return;
    }

    if (nextStatus === CampaignStatus.FAILED) {
      await this.campaignModel.findByIdAndUpdate(campaignId, {
        $set: {
          status: CampaignStatus.FAILED,
          completedAt: new Date(),
          failureReason: 'All campaign recipients failed delivery',
        },
      });
    } else {
      await this.campaignModel.findByIdAndUpdate(campaignId, {
        $set: { status: CampaignStatus.COMPLETED, completedAt: new Date() },
        $unset: { failureReason: 1 },
      });
    }

    this.logger.log(`[Campaign ${campaignId}] Status -> ${nextStatus} from webhook delivery statuses`);
  }

  private async findRecentCampaignRecipientForStatus(
    status: any,
    metadata: any,
    timestamp: Date,
  ): Promise<{
    id: bigint;
    campaign_id: string;
    business_id: string;
    whatsapp_message_id: string | null;
    status: string;
    sent_at: Date | null;
    delivered_at: Date | null;
    read_at: Date | null;
    failed_at: Date | null;
  } | null> {
    const recipientPhone = status?.recipient_id;
    const phoneNumberId = metadata?.phone_number_id;
    const gupshupAppId = metadata?.gupshup_app_id ?? metadata?.gs_app_id ?? metadata?.appId;

    if (!recipientPhone || (!phoneNumberId && !gupshupAppId)) {
      return null;
    }

    const account = await this.prisma.social_accounts.findFirst({
      where: {
        platform: 'whatsapp',
        is_active: true,
        OR: [
          ...(phoneNumberId ? [{ page_id: String(phoneNumberId) }] : []),
          ...(gupshupAppId ? [{ gupshup_app_id: String(gupshupAppId) }] : []),
        ],
      },
      select: { business_id: true },
    });

    if (!account) {
      this.logger.warn(
        `[CampaignDelivery] No active WhatsApp account found for webhook phoneNumberId=${phoneNumberId ?? 'unknown'} gupshupAppId=${gupshupAppId ?? 'unknown'}`,
      );
      return null;
    }

    const sentAfter = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
    const sentBefore = new Date(timestamp.getTime() + 10 * 60 * 1000);

    return this.prisma.campaign_recipients.findFirst({
      where: {
        business_id: account.business_id,
        phone_number: String(recipientPhone),
        status: { in: ['SENT', 'DELIVERED', 'READ'] },
        sent_at: {
          gte: sentAfter,
          lte: sentBefore,
        },
      },
      orderBy: { sent_at: 'desc' },
      select: {
        id: true,
        campaign_id: true,
        business_id: true,
        whatsapp_message_id: true,
        status: true,
        sent_at: true,
        delivered_at: true,
        read_at: true,
        failed_at: true,
      },
    });
  }
}
