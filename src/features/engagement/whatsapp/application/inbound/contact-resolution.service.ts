import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../../../prisma/prisma.service';

export interface ResolvedWhatsAppContact {
  account: any;
  contact_name: string;
  lead: any;
}

@Injectable()
export class ContactResolutionService {
  private readonly logger = new Logger(ContactResolutionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolveForInboundMessage(params: {
    phone_number_id: string;
    from: string;
    contacts: any[];
  }): Promise<ResolvedWhatsAppContact | null> {
    const account = await this.prisma.social_accounts.findFirst({
      where: { platform: 'whatsapp', page_id: params.phone_number_id, is_active: true },
      include: { businesses: true },
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

    const lead = await this.prisma.leads.upsert({
      where: {
        business_id_platform_id: {
          business_id: account.business_id,
          platform_id: params.from,
        },
      },
      create: {
        lead_id: randomUUID(),
        business_id: account.business_id,
        tenant_id: account.businesses.tenant_id,
        channel: 'whatsapp',
        source: 'direct',
        platform_id: params.from,
        name: contactName,
        phone: params.from,
        status: 'new',
        pipeline_id: defaultPipelineId,
        stage_id: defaultStageId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      update: { updated_at: new Date() },
    });

    return {
      account,
      contact_name: contactName,
      lead,
    };
  }
}
