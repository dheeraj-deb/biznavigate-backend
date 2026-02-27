import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversations.schema';
import { Messages, MessagesDocument } from './schemas/messages.schema';
import { ConversationContext, ConversationContextDocument } from './schemas/conversation_context.schema';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Messages.name) private readonly messagesModel: Model<MessagesDocument>,
    @InjectModel(ConversationContext.name) private readonly contextModel: Model<ConversationContextDocument>,
  ) {}

  // ─── Conversation ─────────────────────────────────────────────────────────

  async createConversation(data: Partial<Conversation>): Promise<ConversationDocument> {
    const conversation = new this.conversationModel(data);
    return conversation.save();
  }

  async findActiveConversation(lead_id: string, channel: string): Promise<ConversationDocument | null> {
    return this.conversationModel.findOne({ lead_id, channel, status: 'active' }).exec();
  }

  async findConversationById(conversation_id: string): Promise<ConversationDocument | null> {
    return this.conversationModel.findOne({ conversation_id }).exec();
  }

  async findConversationsByBusiness(
    business_id: string,
    tenant_id: string,
    filter: { status?: string; channel?: string } = {},
  ): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ business_id, tenant_id, ...filter })
      .sort({ updated_at: -1 })
      .exec();
  }

  async updateConversation(
    conversation_id: string,
    data: Partial<Conversation>,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel
      .findOneAndUpdate({ conversation_id }, { $set: data }, { new: true })
      .exec();
  }

  async closeConversation(conversation_id: string): Promise<ConversationDocument | null> {
    return this.conversationModel
      .findOneAndUpdate(
        { conversation_id },
        { $set: { status: 'ended' } },
        { new: true },
      )
      .exec();
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  async createMessage(data: Partial<Messages>): Promise<MessagesDocument> {
    const message = new this.messagesModel(data);
    return message.save();
  }

  async findMessageByPlatformId(platform_message_id: string): Promise<MessagesDocument | null> {
    return this.messagesModel.findOne({ platform_message_id }).exec();
  }

  async getConversationHistory(
    conversation_id: string,
    limit: number = 10,
  ): Promise<MessagesDocument[]> {
    return this.messagesModel
      .find({ conversation_id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec()
      .then(msgs => msgs.reverse());
  }

  async updateMessageStatus(
    platform_message_id: string,
    data: { delivery_status: string; delivered_at?: Date; read_at?: Date; failed_reason?: string },
  ): Promise<void> {
    await this.messagesModel
      .updateMany({ platform_message_id }, { $set: data })
      .exec();
  }

  async countMessages(conversation_id: string): Promise<number> {
    return this.messagesModel.countDocuments({ conversation_id }).exec();
  }

  async getFirstAndLastMessage(
    conversation_id: string,
  ): Promise<{ first: MessagesDocument | null; last: MessagesDocument | null }> {
    const [first, last] = await Promise.all([
      this.messagesModel.findOne({ conversation_id }).sort({ timestamp: 1 }).exec(),
      this.messagesModel.findOne({ conversation_id }).sort({ timestamp: -1 }).exec(),
    ]);
    return { first, last };
  }

  // ─── Conversation Context ──────────────────────────────────────────────────

  async getContext(conversation_id: string): Promise<ConversationContextDocument | null> {
    return this.contextModel.findOne({ conversation_id }).exec();
  }

  async upsertContext(
    conversation_id: string,
    memory: Record<string, any>,
  ): Promise<ConversationContextDocument> {
    return this.contextModel
      .findOneAndUpdate(
        { conversation_id },
        { $set: { memory } },
        { new: true, upsert: true },
      )
      .exec();
  }

  async deleteContext(conversation_id: string): Promise<void> {
    await this.contextModel.deleteOne({ conversation_id }).exec();
  }
}
