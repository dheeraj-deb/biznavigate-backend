import { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { sanitizeMessagesForModel } from './message-sanitizer';

describe('sanitizeMessagesForModel', () => {
  it('drops orphan tool messages', () => {
    const messages = [
      new HumanMessage('22, 23'),
      new ToolMessage({ content: 'No rooms available', tool_call_id: 'missing' }),
      new HumanMessage('try again'),
    ];

    const sanitized = sanitizeMessagesForModel(messages);

    expect(sanitized).toHaveLength(2);
    expect(sanitized.every((message) => message.getType() !== 'tool')).toBe(true);
  });

  it('keeps complete assistant tool call groups', () => {
    const messages = [
      new HumanMessage('22, 23'),
      new AIMessage({
        content: '',
        tool_calls: [
          {
            id: 'call_1',
            name: 'check_availability',
            args: { checkIn: '2026-05-22', checkOut: '2026-05-23' },
          },
        ],
      }),
      new ToolMessage({ content: 'FLOW:{}', tool_call_id: 'call_1' }),
    ];

    const sanitized = sanitizeMessagesForModel(messages);

    expect(sanitized).toHaveLength(3);
    expect(sanitized[1].getType()).toBe('ai');
    expect(sanitized[2].getType()).toBe('tool');
  });

  it('drops incomplete assistant tool call groups', () => {
    const messages = [
      new HumanMessage('22, 23'),
      new AIMessage({
        content: '',
        tool_calls: [
          {
            id: 'call_1',
            name: 'check_availability',
            args: { checkIn: '2026-05-22', checkOut: '2026-05-23' },
          },
        ],
      }),
      new HumanMessage('hello'),
    ];

    const sanitized = sanitizeMessagesForModel(messages);

    expect(sanitized).toHaveLength(2);
    expect(sanitized.every((message) => message.getType() !== 'tool')).toBe(true);
    expect(sanitized.every((message) => !(message instanceof AIMessage && message.tool_calls?.length))).toBe(true);
  });
});
