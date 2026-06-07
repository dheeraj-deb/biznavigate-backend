import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WhatsAppService } from 'src/features/engagement/whatsapp/application/whatsapp.service';
import { ConfigResolverService } from './config-resolver.service';
import { ContextAssemblerService } from './context-assembler.service';
import { ExistingLlmAgentService } from './existing-llm-agent.service';
import { ComponentMapperService } from './component-mapper.service';
import { FlowTransitionService } from './flow-transition.service';
import {
  ConversationOrchestratorInput,
  MappedConversationResponse,
} from '../types/conversation-routing.types';

@Injectable()
export class ConversationOrchestratorService {
  private readonly logger = new Logger(ConversationOrchestratorService.name);

  constructor(
    private readonly configResolver: ConfigResolverService,
    private readonly contextAssembler: ContextAssemblerService,
    private readonly agent: ExistingLlmAgentService,
    private readonly mapper: ComponentMapperService,
    private readonly transitions: FlowTransitionService,
    private readonly whatsappService: WhatsAppService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async handleIncoming(input: ConversationOrchestratorInput): Promise<void> {
    const resolvedConfig = await this.configResolver.resolve(input.tenantId, input.wabaId);
    const session = await this.transitions.getSession(input.tenantId, input.wabaId, {
      ...input.session,
      activeFlow: input.session.activeFlow ?? resolvedConfig.flow,
    });
    const effectiveConfig = session.activeFlow && session.activeFlow !== resolvedConfig.flow
      ? { ...resolvedConfig, flow: session.activeFlow }
      : resolvedConfig;

    const packet = await this.contextAssembler.assemble({
      resolvedConfig: effectiveConfig,
      session,
      history: input.history,
    });

    const aiResponse = await this.agent.respond(packet, input.userMessage);
    await this.transitions.applyIfNeeded({
      tenantId: input.tenantId,
      wabaId: input.wabaId,
      session,
      response: aiResponse,
    });

    const mapped = this.mapper.map(aiResponse, effectiveConfig.mode);
    await this.send(input, mapped);
  }

  private async send(input: ConversationOrchestratorInput, mapped: MappedConversationResponse): Promise<void> {
    const ctx = {
      conversationId: input.session.conversationId,
      leadId: input.session.leadId ?? '',
      tenantId: input.tenantId,
    };

    if (mapped.kind === 'buttons') {
      await this.whatsappService.sendButtonMessage(
        input.phoneNumberId,
        input.customerPhone,
        mapped.body,
        mapped.buttons.map((button) => ({ id: button.id, title: button.label })),
      );
      return;
    }

    if (mapped.kind === 'list') {
      await this.whatsappService.sendListMessage(
        input.phoneNumberId,
        input.customerPhone,
        mapped.body,
        mapped.buttonText,
        mapped.sections.map((section) => ({
          title: section.title,
          rows: section.rows.map((row) => ({ id: row.id, title: row.title, description: row.description })),
        })),
      );
      return;
    }

    const text = mapped.kind === 'link' ? mapped.text : mapped.text;
    if (!text.trim()) {
      this.logger.warn(`AI mapped an empty response for conversation ${input.session.conversationId}`);
      return;
    }

    await this.whatsappService.sendAgentReply(
      input.session.metadata?.businessId as string,
      input.phoneNumberId,
      input.customerPhone,
      text,
      ctx,
    );
    this.emitBookingLinkSentIfPresent(input, text);
  }

  private emitBookingLinkSentIfPresent(input: ConversationOrchestratorInput, text: string): void {
    const bookingLink = this.extractBookingLink(text);
    const businessId = input.session.metadata?.businessId;
    if (!bookingLink || typeof businessId !== 'string') return;

    const url = new URL(bookingLink);
    const checkIn = url.searchParams.get('checkIn') || undefined;
    const checkOut = url.searchParams.get('checkOut') || undefined;
    this.eventEmitter.emit('workflow.event.booking.link_sent', {
      business_id: businessId,
      tenant_id: input.tenantId,
      lead_id: input.session.leadId,
      event_name: 'booking.link_sent',
      payload: {
        booking_link: bookingLink,
        dates: checkIn && checkOut ? `${checkIn} to ${checkOut}` : undefined,
        check_in: checkIn,
        check_out: checkOut,
        guests: url.searchParams.get('guests') || undefined,
        customer_phone: input.customerPhone,
      },
      emitted_at: new Date().toISOString(),
    });
  }

  private extractBookingLink(text: string): string | null {
    const match = text.match(/https?:\/\/\S+\/book\/[^\s]+/);
    if (!match) return null;
    try {
      return new URL(match[0]).toString();
    } catch {
      return null;
    }
  }
}
