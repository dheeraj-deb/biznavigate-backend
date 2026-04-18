import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

export interface ConversationalReply {
  // Immediate ack to send before the agent processes (e.g. "Let me check!")
  acknowledgment: string | null;
  // The actual reply split into 1–3 natural message chunks
  chunks: string[];
}

@Injectable()
export class AcknowledgmentService {
  private readonly logger = new Logger(AcknowledgmentService.name);
  private readonly fastLlm: ChatOpenAI;
  private readonly splitLlm: ChatOpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') ?? '';
    // Fast, cheap model for the immediate ack
    this.fastLlm = new ChatOpenAI({ model: 'gpt-4o-mini', apiKey, temperature: 0.8, maxTokens: 40 });
    // Used to split the agent's reply into natural message chunks
    this.splitLlm = new ChatOpenAI({ model: 'gpt-4o-mini', apiKey, temperature: 0.3, maxTokens: 300 });
  }

  // Generates a short, situational acknowledgment to send immediately
  // while the agent is still processing — before the real reply is ready.
  async generateAck(userMessage: string, businessType: string): Promise<string | null> {
    const prompt = `You are a friendly WhatsApp assistant for a ${businessType} business.

The customer just sent: "${userMessage}"

Write ONE short acknowledgment message (max 10 words) that:
- Matches the situation and tone (curious? urgent? casual? complaint?)
- Sounds like a real person, not a bot script
- Shows you understood and are acting on it
- Does NOT use "certainly", "absolutely", "of course", "sure thing", "great"
- Does NOT reveal the answer yet

Good examples by situation:
- Checking availability → "On it! Checking for those dates 🔍"
- Asking price → "Let me pull that up for you."
- Cancelling → "Got it, looking up your booking now."
- Complaint → "Oh no, I'm sorry to hear that. Let me look into this."
- Greeting → "Hey! How can I help you today? 😊"
- Order status → "Give me a sec, checking your order."
- General question → "Good question, let me find out."

Respond with ONLY the acknowledgment text.`;

    try {
      const response = await this.fastLlm.invoke([
        new SystemMessage(prompt),
        new HumanMessage(userMessage),
      ]);
      const ack = (response.content as string).trim().replace(/^["']|["']$/g, '');
      return ack || null;
    } catch (err) {
      this.logger.warn(`Ack generation failed (non-fatal): ${err.message}`);
      return null;
    }
  }

  // Splits a single agent reply into 1–3 natural WhatsApp-style message chunks.
  // Each chunk represents a separate message a human would send in sequence.
  async splitIntoChunks(reply: string): Promise<string[]> {
    // Don't split very short replies — just send as one message
    if (reply.length < 80) return [reply];

    const prompt = `You are formatting a WhatsApp reply to send as multiple messages, like a human would naturally type.

Original reply:
"""
${reply}
"""

Split this into 2–3 natural WhatsApp messages. Rules:
- Each message should feel like a separate thought, not a sentence fragment
- First message: the direct answer or main point
- Second message: details, options, or next steps
- Third message (only if needed): a call to action or question
- Keep each message under 200 characters
- Do NOT add any numbering, bullets, or prefixes
- Preserve emojis and formatting from the original
- If the original is already conversational and short, return it as a single message

Return ONLY the messages separated by the exact delimiter "|||" with no spaces around it.
Example: "Yes, we have rooms available!|||A deluxe room for ₹4,500 and standard for ₹2,800 per night.|||Want me to book one for you? 😊"`;

    try {
      const response = await this.splitLlm.invoke([new SystemMessage(prompt)]);
      const raw = (response.content as string).trim();
      const chunks = raw
        .split('|||')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      return chunks.length > 0 ? chunks : [reply];
    } catch (err) {
      this.logger.warn(`Reply splitting failed (non-fatal): ${err.message}`);
      return [reply];
    }
  }
}
