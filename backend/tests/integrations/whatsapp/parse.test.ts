import { describe, expect, it } from 'vitest';
import { hasStatusEvents, parseInboundTextMessages } from '@/lib/integrations/whatsapp/parse';

describe('WhatsApp webhook parsing', () => {
  it('extracts inbound text messages', () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              field: 'messages',
              value: {
                contacts: [{ profile: { name: 'Rahul' }, wa_id: '919999888877' }],
                messages: [{ from: '919999888877', id: 'wamid.HBgM', timestamp: '1700000000', type: 'text', text: { body: 'Hunter 350 price?' } }],
              },
            },
          ],
        },
      ],
    };
    const msgs = parseInboundTextMessages(payload as any);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toMatchObject({ waId: '919999888877', profileName: 'Rahul', messageId: 'wamid.HBgM', text: 'Hunter 350 price?' });
  });

  it('ignores non-text messages safely', () => {
    const payload = {
      object: 'whatsapp_business_account',
      entry: [{ changes: [{ value: { messages: [{ from: '919999888877', id: 'wamid.IMG', type: 'image', image: { id: 'x' } }] } }] }],
    };
    expect(parseInboundTextMessages(payload as any)).toHaveLength(0);
  });

  it('detects status-only events', () => {
    expect(hasStatusEvents({ entry: [{ changes: [{ value: { statuses: [{ id: 's1', status: 'sent' }] } }] }] } as any)).toBe(true);
    expect(hasStatusEvents({ entry: [{ changes: [{ value: { messages: [] } }] }] } as any)).toBe(false);
  });
});
