import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ExecuteAiActionDto } from '../dto/ai-action.dto';
import { AiActionHandler } from './ai-action-handler';

@Injectable()
export class CreateProductInquiryHandler implements AiActionHandler {
  readonly action = 'create_product_inquiry' as const;

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: ExecuteAiActionDto) {
    if (!dto.lead_id) throw new BadRequestException('lead_id is required');

    const lead = await this.prisma.leads.findFirst({
      where: { lead_id: dto.lead_id, business_id: dto.business_id },
      select: { lead_id: true, tenant_id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    if (dto.params.item_id) {
      const item = await this.prisma.catalog_items.findFirst({
        where: {
          item_id: dto.params.item_id,
          business_id: dto.business_id,
          deleted_at: null,
          item_type: 'physical_product',
        },
        select: { item_id: true },
      });
      if (!item) throw new NotFoundException('Product item not found');
    }

    const inquiry = await this.prisma.product_inquiries.create({
      data: {
        business_id: dto.business_id,
        tenant_id: dto.tenant_id ?? lead.tenant_id,
        lead_id: lead.lead_id,
        item_id: dto.params.item_id ?? null,
        variant_id: dto.params.variant_id ?? null,
        quantity: dto.params.quantity ? Number(dto.params.quantity) : null,
        delivery_pincode: dto.params.delivery_pincode ?? null,
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
          note: 'Product inquiry created by AI action router',
          product_inquiry_id: inquiry.inquiry_id,
        },
      },
    });

    return {
      product_inquiry_id: inquiry.inquiry_id,
      status: inquiry.status,
    };
  }
}
