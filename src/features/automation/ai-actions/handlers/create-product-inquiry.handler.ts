import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ExecuteAiActionDto } from '../dto/ai-action.dto';
import { AiActionHandler } from './ai-action-handler';
import { LeadCommandService } from '../../../crm/lead/application/services/lead-command.service';
import { LeadTypes } from '../../../crm/lead/application/lead-types';

@Injectable()
export class CreateProductInquiryHandler implements AiActionHandler {
  readonly action = 'create_product_inquiry' as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly leadCommands: LeadCommandService,
  ) {}

  async execute(dto: ExecuteAiActionDto) {
    if (!dto.lead_id) throw new BadRequestException('lead_id is required');

    const lead = await this.prisma.leads.findFirst({
      where: { lead_id: dto.lead_id, business_id: dto.business_id },
      select: { lead_id: true, tenant_id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    let productItem: { item_id: string; name: string | null } | null = null;
    if (dto.params.item_id) {
      productItem = await this.prisma.catalog_items.findFirst({
        where: {
          item_id: dto.params.item_id,
          business_id: dto.business_id,
          deleted_at: null,
          item_type: 'physical_product',
        },
        select: { item_id: true, name: true },
      });
      if (!productItem) throw new NotFoundException('Product item not found');
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

    await this.leadCommands.updateLeadType({
      leadId: lead.lead_id,
      businessId: dto.business_id,
      leadType: LeadTypes.PRODUCT_ENQUIRY,
      context: {
        type: 'product',
        items: productItem ? [{
          id: productItem.item_id,
          name: productItem.name ?? '',
          variant: dto.params.variant_id,
          qty: dto.params.quantity ? Number(dto.params.quantity) : 1,
        }] : undefined,
        pincode: dto.params.delivery_pincode,
        budget: dto.params.budget,
      },
    });

    await this.leadCommands.recordLeadEvent({
      leadId: lead.lead_id,
      businessId: dto.business_id,
      type: 'product_inquiry_created',
      actor: 'ai',
      data: {
        product_inquiry_id: inquiry.inquiry_id,
        item_id: productItem?.item_id,
        item_name: productItem?.name,
        quantity: dto.params.quantity ? Number(dto.params.quantity) : undefined,
        status: inquiry.status,
      },
    });

    await this.leadCommands.autoAdvance({
      leadId: lead.lead_id,
      toSlug: 'qualified',
      reason: 'product_inquiry_created',
      actor: 'ai',
    });

    return {
      product_inquiry_id: inquiry.inquiry_id,
      status: inquiry.status,
    };
  }
}
