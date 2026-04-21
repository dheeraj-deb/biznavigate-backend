import { Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AgentStateType } from '../graph/agent-state';
import { PrismaService } from '../../../prisma/prisma.service';

// Intent labels shared across all verticals
const INTENT_PROMPT = `You are an intent classifier for a business chatbot. The business may be in hospitality, retail, e-commerce, services, education, healthcare, or consulting.

Classify the user's last message into exactly one of:

- browse        (wants to see products, services, courses, rooms, or ask "what do you have?")
- booking       (wants to check availability, get pricing, or make a new reservation/appointment/order)
- cancellation  (wants to cancel or modify an existing booking, order, or appointment)
- status        (asking about an existing booking/order — confirmation, tracking, check-in details)
- complaint     (expressing dissatisfaction, reporting a problem, bad experience)
- support       (needs help with something — issue, lost item, maintenance, in-session problem)
- faq           (general question about the business, facilities, policies, directions, pricing)
- payment       (asking about charges, refunds, invoices, or payment methods)
- handoff       (explicitly wants to speak to a human / live agent)
- greeting      (just saying hi, hello, or starting a conversation)
- other         (unrelated or spam — confident it has nothing to do with the business)

Rules:
- Pick the SINGLE best match.
- Complaints about a booking/order are "complaint", not "status".
- "Can I cancel?" is "cancellation", not "faq".
- "What rooms do you have?" is "browse", not "booking".
- If NOT confident (ambiguous or mixed signals), return "handoff".
- Respond with ONLY the intent label, nothing else.`;

const VALID_INTENTS = new Set([
  'browse', 'booking', 'cancellation', 'status', 'complaint',
  'support', 'faq', 'payment', 'handoff', 'greeting', 'other',
]);

const logger = new Logger('TriageNode');

export function makeTriageNode(openaiApiKey: string, prisma: PrismaService) {
  const llm = new ChatOpenAI({ model: 'gpt-4o-mini', apiKey: openaiApiKey, temperature: 0 });

  return async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    const userMsg = state.messages.at(-1)?.content;
    logger.log(`Triaging: "${String(userMsg).slice(0, 100)}"`);

    // Resolve business_type from DB (cached in state after first turn)
    let businessType = state.businessType;
    if (!businessType && state.businessId) {
      try {
        const biz = await prisma.businesses.findUnique({
          where: { business_id: state.businessId },
          select: { business_type: true },
        });
        businessType = (biz?.business_type ?? 'default').toLowerCase();
        logger.log(`Resolved business_type=${businessType} for ${state.businessId}`);
      } catch {
        businessType = 'default';
      }
    }

    // Classify intent
    const response = await llm.invoke([
      new SystemMessage(INTENT_PROMPT),
      new HumanMessage(String(userMsg)),
    ]);

    const raw = (response.content as string).trim().toLowerCase();
    const intent = VALID_INTENTS.has(raw) ? raw : 'handoff';
    logger.log(`Intent → ${intent} | businessType → ${businessType}`);

    return { intent, businessType };
  };
}
