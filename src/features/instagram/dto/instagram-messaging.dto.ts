import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export class ReplyToCommentDto {
    @IsString()
  commentId: string;

    @IsString()
  message: string;

  @IsString()
  accountId: string;
}

export class ReplyToDirectMessageDto {
    @IsString()
  recipientId: string;

    @IsString()
  message: string;

  @IsString()
  accountId: string;

    @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

    @IsString()
  @IsOptional()
  mediaUrl?: string;
}

export class GetConversationsDto {
  @IsString()
  accountId: string;

    @IsString()
  @IsOptional()
  limit?: string;

    @IsString()
  @IsOptional()
  after?: string;
}

export class GetMessagesDto {
    @IsString()
  conversationId: string;

  @IsString()
  accountId: string;

    @IsString()
  @IsOptional()
  limit?: string;

    @IsString()
  @IsOptional()
  after?: string;
}

export class DeleteCommentDto {
    @IsString()
  commentId: string;

  @IsString()
  accountId: string;
}

export class HideCommentDto {
    @IsString()
  commentId: string;

  @IsString()
  accountId: string;

    @IsString()
  hide: string; // 'true' or 'false'
}
