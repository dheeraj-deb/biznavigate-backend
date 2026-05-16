import { Logger } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { AgentStateType } from '../graph/agent-state';
import { AgentModelConfig, createChatModel } from '../graph/llm-factory';
import { sanitizeMessagesForModel } from '../utils/message-sanitizer';

// Intent labels shared across all verticals
const INTENT_PROMPT = `You are an intent classifier for a business chatbot. The business may be in hospitality, retail, e-commerce, services, education, healthcare, or consulting.

You will receive the recent conversation history followed by the user's latest message.

Classify the user's LATEST message into exactly one of:

- browse        (wants to see products, services, courses, rooms, or ask "what do you have?")
- booking       (wants to check availability, get pricing, or make a new reservation/appointment/order)
- cancellation  (wants to cancel or modify an existing booking, order, or appointment)
- status        (asking about an existing booking/order — confirmation, tracking, check-in details)
- complaint     (expressing dissatisfaction, reporting a problem, bad experience)
- support       (needs help with something — issue, lost item, maintenance, in-session problem)
- faq           (general question about the business, facilities, amenities, policies, rules, address, directions, pricing, timings, documents, or uploaded business knowledge)
- payment       (asking about charges, refunds, invoices, or payment methods)
- handoff       (explicitly wants to speak to a human / live agent)
- greeting      (just saying hi, hello, or starting a conversation)
- other         (unrelated or spam — confident it has nothing to do with the business)

Rules:
- Pick the SINGLE best match.
- CRITICAL: If the assistant's previous message was asking the user a question (e.g. asking for dates, name, order ID, preferences), treat the user's reply as continuing that same intent — even if the reply looks like a short answer (e.g. "20 to 21", "John", "tomorrow").
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

export function makeTriageNode(modelConfig: AgentModelConfig) {
  const llm = createChatModel({
    model: modelConfig.fastModel,
    apiKey: modelConfig.apiKey,
    baseUrl: modelConfig.baseUrl,
    temperature: 0,
  });

  return async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    const userMsg = state.messages.at(-1)?.content;
    logger.log(`Triaging: "${String(userMsg).slice(0, 100)}"`);

    // businessType is already resolved by AgentContextBuilder via state.businessProfile
    const businessType = state.businessType ?? state.businessProfile?.business_type ?? 'default';

    // Include last 5 messages as context so the classifier understands follow-up replies
    // (e.g. user says "20 to 21" after bot asked for check-in/check-out dates)
    const contextMessages = sanitizeMessagesForModel(state.messages).slice(-5);
    const response = await llm.invoke([
      new SystemMessage(INTENT_PROMPT),
      ...contextMessages,
    ]);

    const raw = (response.content as string).trim().toLowerCase();
    const intent = VALID_INTENTS.has(raw) ? raw : 'handoff';
    logger.log(`Intent → ${intent} | businessType → ${businessType}`);

    return { intent, businessType };
  };
}
