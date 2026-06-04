import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversations.schema';
import { Messages, MessagesDocument } from './schemas/messages.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name) private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Messages.name) private readonly messagesModel: Model<MessagesDocument>,
  ) {}

  // ─── Conversation ─────────────────────────────────────────────────────────

  async createConversation(data: Partial<Conversation>): Promise<ConversationDocument> {
    const conversation = new this.conversationModel(data);
    return conversation.save();
  }

  async findActiveConversation(lead_id: string, channel: string, business_id?: string): Promise<ConversationDocument | null> {
    const query: any = { lead_id, channel, status: { $in: ['open', 'handed_off'] } };
    if (business_id) query.business_id = business_id;
    return this.conversationModel.findOne(query).sort({ updated_at: -1 }).exec();
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

  async findConversationsByBusinessAndStatus(
    business_id: string,
    status: string,
  ): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ business_id, status })
      .sort({ updated_at: 1 })
      .exec();
  }

  async findConversationsPaginated(
    business_id: string,
    tenant_id: string,
    filter: { status?: string; channel?: string; search?: string } = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: ConversationDocument[]; total: number }> {
    const query: any = { business_id };
    const andClauses: any[] = [];
    if (tenant_id) {
      andClauses.push({
        $or: [{ tenant_id }, { tenant_id: { $exists: false } }, { tenant_id: null }],
      });
    }

    if (filter.status) query.status = filter.status;
    if (filter.channel) query.channel = filter.channel;
    if (filter.search) {
      andClauses.push({
        $or: [
          { sender_name: { $regex: filter.search, $options: 'i' } },
          { message_text: { $regex: filter.search, $options: 'i' } },
          { customer_id: { $regex: filter.search, $options: 'i' } },
        ],
      });
    }
    if (andClauses.length) query.$and = andClauses;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.conversationModel.find(query).sort({ updated_at: -1 }).skip(skip).limit(limit).exec(),
      this.conversationModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async findMessagesByConversation(
    conversation_id: string,
    page: number = 1,
    limit: number = 50,
    business_id?: string,
  ): Promise<{ data: MessagesDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = { conversation_id };
    if (business_id) query.business_id = business_id;

    const [data, total] = await Promise.all([
      this.messagesModel.find(query).sort({ timestamp: 1 }).skip(skip).limit(limit).exec(),
      this.messagesModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  /**
   * Fetch the latest `limit` messages for each conversation in `conversationIds`.
   * If `cursor` (ISO timestamp or message _id string) is provided, only messages
   * with timestamp < cursor are considered — enabling "load older" pagination.
   *
   * Returns a map of conversationId → messages[] (oldest-first within each bucket).
   */
  async findBatchMessagesByCursor(
    businessId: string,
    conversationIds: string[],
    limit: number,
    cursor?: string,
  ): Promise<Record<string, MessagesDocument[]>> {
    if (!conversationIds.length) return {};

    const matchStage: Record<string, any> = {
      business_id: businessId,
      conversation_id: { $in: conversationIds },
    };
    if (cursor) {
      matchStage.timestamp = { $lt: new Date(cursor) };
    }

    // Aggregation: match → sort desc → group per conversation → slice → unwind → sort asc
    const rows: { _id: string; messages: MessagesDocument[] }[] =
      await this.messagesModel.aggregate([
        { $match: matchStage },
        { $sort: { conversation_id: 1, timestamp: -1 } },
        {
          $group: {
            _id: '$conversation_id',
            messages: { $push: '$$ROOT' },
          },
        },
        {
          $project: {
            messages: { $slice: ['$messages', limit] },
          },
        },
      ]);

    const result: Record<string, MessagesDocument[]> = {};
    for (const row of rows) {
      // Reverse so they're oldest-first (we sorted desc in the aggregation)
      result[row._id] = row.messages.reverse();
    }
    // Ensure every requested conversation has an entry even if there are no messages
    for (const id of conversationIds) {
      if (!result[id]) result[id] = [];
    }
    return result;
  }

  /** Update last-message preview and summary so the conversation surfaces correctly in inbox/dashboard lists. */
  async touchConversation(conversation_id: string, message_text: string, at: Date = new Date()): Promise<void> {
    const [messageCount, latestMessage] = await Promise.all([
      this.messagesModel.countDocuments({ conversation_id }).exec(),
      this.messagesModel
        .findOne({ conversation_id })
        .sort({ timestamp: -1, created_at: -1 })
        .select({ message_text: 1, timestamp: 1, created_at: 1 })
        .lean()
        .exec(),
    ]);

    await this.conversationModel
      .findOneAndUpdate(
        { conversation_id },
        {
          $set: {
            message_text: latestMessage?.message_text ?? message_text,
            last_message_at: latestMessage?.timestamp ?? latestMessage?.created_at ?? at,
            message_count: messageCount,
          },
        },
        { new: false },
      )
      .exec();
  }

  async recordMessageSummary(conversation_id: string, message_text?: string, at: Date = new Date()): Promise<void> {
    await this.conversationModel
      .updateOne(
        { conversation_id },
        {
          $set: {
            ...(message_text !== undefined ? { message_text } : {}),
            last_message_at: at,
          },
          $inc: { message_count: 1 },
        },
      )
      .exec();
  }

  /**
   * Records the time of the latest INBOUND message on this conversation. This
   * is the canonical signal the WhatsApp 24-hour-window gate reads to decide
   * whether automations can send free-form messages. Called only from inbound
   * persist paths — never from outbound, otherwise automations could
   * accidentally extend their own window.
   */
  async markInbound(conversation_id: string, at: Date = new Date()): Promise<void> {
    await this.conversationModel
      .updateOne({ conversation_id }, { $set: { last_inbound_at: at } })
      .exec();
  }

  async findConversationsByIds(conversationIds: string[]): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ conversation_id: { $in: conversationIds } })
      .exec();
  }

  async updateConversation(
    conversation_id: string,
    data: Partial<Conversation>,
  ): Promise<ConversationDocument | null> {
    return this.conversationModel
      .findOneAndUpdate({ conversation_id }, { $set: data }, { returnDocument: 'after' })
      .exec();
  }

  async closeConversation(conversation_id: string): Promise<ConversationDocument | null> {
    return this.conversationModel
      .findOneAndUpdate(
        { conversation_id },
        { $set: { status: 'ended' } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  // ─── Messages ─────────────────────────────────────────────────────────────

  async createMessage(data: Partial<Messages>): Promise<MessagesDocument> {
    const message = new this.messagesModel(data);
    const saved = await message.save();
    await this.recordMessageSummary(
      saved.conversation_id,
      saved.message_text,
      saved.timestamp ? new Date(saved.timestamp) : new Date(),
    );
    return saved;
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

}
