import { WhatsAppMessageNormalizer } from './whatsapp-message-normalizer.service';

describe('WhatsAppMessageNormalizer', () => {
  const service = new WhatsAppMessageNormalizer();

  it('normalizes text messages', () => {
    const result = service.normalize({
      id: 'wamid-1',
      from: '919999999999',
      timestamp: '1770000000',
      type: 'text',
      text: { body: 'Hello' },
    });

    expect(result).toEqual(expect.objectContaining({
      message_id: 'wamid-1',
      from: '919999999999',
      message_type: 'text',
      message_text: 'Hello',
      user_input: 'Hello',
      is_interactive: false,
      is_catalog_order: false,
    }));
  });

  it('normalizes media messages with captions', () => {
    const result = service.normalize({
      id: 'wamid-2',
      from: '919999999999',
      type: 'document',
      document: { id: 'media-1', caption: 'Invoice' },
    });

    expect(result.message_text).toBe('Invoice');
    expect(result.media_data).toEqual({ id: 'media-1', caption: 'Invoice' });
  });

  it('normalizes button replies', () => {
    const result = service.normalize({
      id: 'wamid-3',
      from: '919999999999',
      type: 'interactive',
      interactive: {
        type: 'button_reply',
        button_reply: { id: 'confirm_booking', title: 'Confirm' },
      },
    });

    expect(result).toEqual(expect.objectContaining({
      message_text: 'Confirm',
      button_id: 'confirm_booking',
      user_input: 'confirm_booking',
      is_interactive: true,
    }));
  });

  it('normalizes list replies', () => {
    const result = service.normalize({
      id: 'wamid-4',
      from: '919999999999',
      type: 'interactive',
      interactive: {
        type: 'list_reply',
        list_reply: { id: 'room_deluxe', title: 'Deluxe Room' },
      },
    });

    expect(result.message_text).toBe('Deluxe Room');
    expect(result.user_input).toBe('room_deluxe');
  });

  it('marks catalog order payloads', () => {
    const result = service.normalize({
      id: 'wamid-6',
      from: '919999999999',
      type: 'order',
    });

    expect(result.is_catalog_order).toBe(true);
    expect(result.message_text).toBe('[Catalog order]');
  });

  it('normalizes unsupported types without throwing', () => {
    const result = service.normalize({
      id: 'wamid-7',
      from: '919999999999',
      type: 'unknown_type',
    });

    expect(result.message_text).toBe('[Unsupported message type: unknown_type]');
  });
});
