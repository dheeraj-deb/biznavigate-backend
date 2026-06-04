import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { LeadPhoneResolverService } from '../../../../crm/lead/utils/lead-phone-resolver.service';

export interface ResolvedWhatsAppContact {
  account: any;
  contact_name: string;
  lead: any;
}

@Injectable()
export class ContactResolutionService {
  private readonly logger = new Logger(ContactResolutionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly phoneResolver: LeadPhoneResolverService,
  ) {}

  async resolveForInboundMessage(params: {
    phone_number_id: string;
    from: string;
    contacts: any[];
  }): Promise<ResolvedWhatsAppContact | null> {
    const account = await this.prisma.social_accounts.findFirst({
      where: { platform: 'whatsapp', page_id: params.phone_number_id, is_active: true },
      include: {
        businesses: {
          select: {
            tenant_id: true,
            business_name: true,
            business_type: true,
          },
        },
      },
    });

    if (!account) {
      this.logger.warn(`No active WhatsApp account found for phone number ID: ${params.phone_number_id}`);
      return null;
    }

    const contact = params.contacts?.find((item) => item.wa_id === params.from);
    const contactName = contact?.profile?.name || params.from;

    const customer = await this.prisma.customers.findFirst({
      where: { business_id: account.business_id, platform_user_id: params.from },
      select: { customer_id: true },
    });

    if (!customer) {
      await this.prisma.customers.create({
        data: {
          business_id: account.business_id,
          tenant_id: account.businesses.tenant_id,
          name: contactName,
          platform_user_id: params.from,
          whatsapp_number: params.from,
          phone: params.from,
        },
      });
    }

    // Upsert on the new (business_id, platform_id) unique key — race-safe.
    const defaultPipeline = await this.prisma.pipelines.findFirst({
      where: { business_id: account.business_id, is_default: true, is_archived: false },
      select: { pipeline_id: true, stages: { orderBy: { position: 'asc' }, take: 1, select: { stage_id: true } } },
    });
    const defaultStageId = defaultPipeline?.stages?.[0]?.stage_id ?? null;
    const defaultPipelineId = defaultPipeline?.pipeline_id ?? null;

    // Resolve to canonical phone first so two leads representing the same human
    // (WhatsApp's "919…" form and the public-booking form's bare local form)
    // collapse onto one row. We look up by `(business_id, phone)`; the platform_id
    // is still populated for the WhatsApp channel so legacy callers that match on
    // it continue to work.
    const normalizedPhone =
      (await this.phoneResolver.normalize(account.business_id, params.from)) ?? params.from;

    let lead = await this.prisma.leads.findFirst({
      where: { business_id: account.business_id, phone: normalizedPhone, deleted_at: null },
    });

    if (!lead) {
      lead = await this.prisma.leads.create({
        data: {
          lead_id: randomUUID(),
          business_id: account.business_id,
          tenant_id: account.businesses.tenant_id,
          channel: 'whatsapp',
          source: 'direct',
          platform_id: params.from,
          name: contactName,
          phone: normalizedPhone,
          status: 'new',
          pipeline_id: defaultPipelineId,
          stage_id: defaultStageId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    } else {
      lead = await this.prisma.leads.update({
        where: { lead_id: lead.lead_id },
        data: {
          // Backfill the WhatsApp platform_id on leads created by other channels so
          // the inbound resolver can still find them via platform_id paths if needed.
          ...(lead.platform_id ? {} : { platform_id: params.from }),
          updated_at: new Date(),
        },
      });
    }

    return {
      account,
      contact_name: contactName,
      lead,
    };
  }
}
