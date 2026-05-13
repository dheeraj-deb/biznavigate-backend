import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ExecuteAiActionDto } from '../dto/ai-action.dto';
import { AiActionHandler } from './ai-action-handler';

@Injectable()
export class CreateHospitalityInquiryHandler implements AiActionHandler {
  readonly action = 'create_hospitality_inquiry' as const;

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: ExecuteAiActionDto) {
    if (!dto.lead_id) throw new BadRequestException('lead_id is required');

    const lead = await this.prisma.leads.findFirst({
      where: { lead_id: dto.lead_id, business_id: dto.business_id },
      select: { lead_id: true, tenant_id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    if (dto.params.preferred_item_id) {
      const item = await this.prisma.catalog_items.findFirst({
        where: {
          item_id: dto.params.preferred_item_id,
          business_id: dto.business_id,
          deleted_at: null,
          item_type: { in: ['accommodation', 'activity', 'service'] },
        },
        select: { item_id: true },
      });
      if (!item) throw new NotFoundException('Preferred hospitality item not found');
    }

    const inquiry = await this.prisma.hospitality_inquiries.create({
      data: {
        business_id: dto.business_id,
        tenant_id: dto.tenant_id ?? lead.tenant_id,
        lead_id: lead.lead_id,
        preferred_item_id: dto.params.preferred_item_id ?? null,
        check_in: dto.params.check_in ? new Date(dto.params.check_in) : null,
        check_out: dto.params.check_out ? new Date(dto.params.check_out) : null,
        guests: dto.params.guests ? Number(dto.params.guests) : null,
        budget: dto.params.budget ?? null,
        status: dto.params.status ?? 'open',
        metadata: {
          source: 'ai_action_router',
          raw_params: dto.params,
        },
      },
    });

    await this.prisma.lead_events.create({
      data: {
        lead_id: lead.lead_id,
        business_id: dto.business_id,
        type: 'note',
        actor: 'ai',
        data: {
          note: 'Hospitality inquiry created by AI action router',
          hospitality_inquiry_id: inquiry.inquiry_id,
        },
      },
    });

    return {
      hospitality_inquiry_id: inquiry.inquiry_id,
      status: inquiry.status,
    };
  }
}
