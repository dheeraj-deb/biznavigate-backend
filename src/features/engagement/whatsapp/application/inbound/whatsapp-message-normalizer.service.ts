import { Injectable } from '@nestjs/common';

export interface NormalizedWhatsAppMessage {
  from: string;
  message_id: string;
  timestamp?: string;
  message_type: string;
  message_text: string;
  media_data?: Record<string, any> | null;
  button_id?: string | null;
  is_interactive: boolean;
  user_input: string;
  is_catalog_order: boolean;
  raw: any;
}

@Injectable()
export class WhatsAppMessageNormalizer {
  normalize(message: any): NormalizedWhatsAppMessage {
    const messageType = message.type;
    let messageText = '';
    let mediaData: Record<string, any> | null = null;
    let buttonId: string | null = null;
    let isCatalogOrder = false;

    switch (messageType) {
      case 'text':
        messageText = message.text?.body || '';
        break;
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
        mediaData = message[messageType];
        messageText = mediaData?.caption || `[${messageType}]`;
        break;
      case 'location':
        messageText = `Location: ${message.location?.latitude}, ${message.location?.longitude}`;
        break;
      case 'interactive':
        if (message.interactive?.type === 'button_reply') {
          messageText = message.interactive.button_reply?.title || '';
          buttonId = message.interactive.button_reply?.id ?? null;
        } else if (message.interactive?.type === 'list_reply') {
          messageText = message.interactive.list_reply?.title || '';
          buttonId = message.interactive.list_reply?.id ?? null;
        } else if (message.interactive?.type === 'nfm_reply') {
          messageText = 'Flow completed';
          buttonId = message.interactive.nfm_reply?.response_json ?? null;
        }
        break;
      case 'order':
        isCatalogOrder = true;
        messageText = '[Catalog order]';
        break;
      case 'reaction':
        messageText = `Reacted with ${message.reaction?.emoji || 'removed reaction'}`;
        break;
      default:
        messageText = `[Unsupported message type: ${messageType}]`;
    }

    const isInteractive = messageType === 'interactive' && !!buttonId;

    return {
      from: message.from,
      message_id: message.id,
      timestamp: message.timestamp,
      message_type: messageType,
      message_text: messageText,
      media_data: mediaData,
      button_id: buttonId,
      is_interactive: isInteractive,
      user_input: isInteractive ? buttonId : messageText,
      is_catalog_order: isCatalogOrder,
      raw: message,
    };
  }
}
