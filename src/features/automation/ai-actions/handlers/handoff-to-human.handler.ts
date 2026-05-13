import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ExecuteAiActionDto } from '../dto/ai-action.dto';
import { AiActionHandler } from './ai-action-handler';

@Injectable()
export class HandoffToHumanHandler implements AiActionHandler {
  readonly action = 'handoff_to_human' as const;

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: ExecuteAiActionDto) {
    if (!dto.lead_id) throw new BadRequestException('lead_id is required');

    const lead = await this.prisma.leads.findFirst({
      where: { lead_id: dto.lead_id, business_id: dto.business_id },
      select: { lead_id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    const reason = dto.params.reason ?? 'AI requested human handoff';
    const event = await this.prisma.lead_events.create({
      data: {
        lead_id: lead.lead_id,
        business_id: dto.business_id,
        type: 'handoff',
        actor: 'ai',
        data: {
          reason,
          conversation_id: dto.conversation_id ?? null,
          escalate_to: dto.params.escalate_to ?? 'human',
        },
      },
    });

    return {
      handoff_event_id: event.event_id,
      status: 'handed_off',
      reason,
    };
  }
}
