import { Logger } from '@nestjs/common';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { AgentStateType } from '../graph/agent-state';
import { AgentModelConfig, createChatModel } from '../graph/llm-factory';
import { sanitizeMessagesForModel } from '../utils/message-sanitizer';

const INTENT_PROMPT = `You are an intent classifier for a hospitality/service booking chatbot.
Customers may write in English, Hindi, Malayalam, or Tamil — in native script OR Romanized/transliterated form (e.g. Manglish, Hinglish, Tanglish). Interpret the message in the customer's language before classifying; do NOT treat transliterated words as English homographs.

Classify the user's last message into exactly one of:

- booking       (wants to check availability, get pricing, or make a new reservation)
- cancellation  (wants to cancel or modify an existing booking)
- status        (asking about an existing booking — confirmation, check-in details, payment)
- complaint     (expressing dissatisfaction, reporting a problem, bad experience)
- support       (needs help with something — Wi-Fi, room issue, lost item, maintenance)
- faq           (general question about the property, facilities, amenities, policies, directions)
- payment       (asking about charges, refunds, invoices, or payment methods)
- handoff       (explicitly wants to speak to a human / live agent)
- greeting      (just saying hi, hello, or starting a conversation)
- other         (unrelated or spam — you are confident it has nothing to do with the business)

Rules:
- Pick the SINGLE best match even if the message could fit multiple.
- Complaints about a booking are "complaint", not "status".
- "Can I cancel?" is "cancellation", not "faq".
- Transliteration hints (NOT English):
  - Malayalam "undo" / "und" / "undo?" = "ഉണ്ടോ" = "is there / do you have" → availability check (booking), NOT the English word "undo".
  - Malayalam "venam" / "vendam" = want / don't want.
  - Hindi "hai" / "hai kya" = "is there" → booking/status depending on context.
  - Tamil "irukka" / "irukku" = "is there / available" → booking.
  - "room undo", "room und", "room available aano" → booking (availability).
  - Only treat "undo / cancel / refund" as cancellation when the surrounding words clearly indicate cancelling an existing booking (e.g. "booking cancel cheyyanam", "cancel my booking").
- If you are NOT confident (ambiguous, mixed signals, or unusual message), return "handoff" so a human can take over.
- Respond with ONLY the intent label, nothing else.`;

const logger = new Logger('IntentDetectorNode');

export function makeIntentDetectorNode(modelConfig: AgentModelConfig) {
  const llm = createChatModel({
    model: modelConfig.fastModel,
    apiKey: modelConfig.apiKey,
    baseUrl: modelConfig.baseUrl,
    temperature: 0,
  });

  return async (state: AgentStateType): Promise<Partial<AgentStateType>> => {
    const messages = sanitizeMessagesForModel(state.messages);
    const userMsg = messages.at(-1)?.content;
    logger.log(`Detecting intent for: "${String(userMsg).slice(0, 100)}"`);

    const response = await llm.invoke([
      new SystemMessage(INTENT_PROMPT),
      new HumanMessage(String(userMsg)),
    ]);

    const VALID_INTENTS = new Set([
      'booking', 'cancellation', 'status', 'complaint',
      'support', 'faq', 'payment', 'handoff', 'greeting', 'other',
    ]);
    const raw = (response.content as string).trim().toLowerCase();
    const intent = VALID_INTENTS.has(raw) ? raw : 'handoff';
    logger.log(`Intent → ${intent}${intent === 'handoff' && !VALID_INTENTS.has(raw) ? ` (raw: "${raw}")` : ''}`);
    return { intent };
  };
}
